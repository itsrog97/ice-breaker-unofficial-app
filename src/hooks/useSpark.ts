import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { streamPost } from '@/api/client';
import { agentApi } from '@/api/endpoints';
import { readSseStream, type SseEvent } from '@/services/sse';
import type { SparkChatMessage, SparkChip } from '@/types/api';
import { qk } from './queries';

export type SparkBlock =
  | { id: string; kind: 'user'; text: string }
  | { id: string; kind: 'assistant'; text: string }
  | { id: string; kind: 'suggestions'; chips: SparkChip[] }
  | { id: string; kind: 'card'; event: string; data: Record<string, unknown> };

/** Friendly status text for server-side tool calls (copied from the web client). */
const TOOL_LABELS: Record<string, string> = {
  search_network: 'Searching Icebreaker…',
  get_commonalities: 'Finding what you have in common…',
  draft_icebreaker: 'Drafting an opener…',
  get_profile: 'Reading their profile…',
  imagine_conversation: 'Imagining the conversation…',
  get_network_stats: 'Looking at the network…',
  send_icebreaker: 'Sending your message…',
  update_memory: 'Noting that down…',
};

const CARD_EVENTS = new Set([
  'profile_card',
  'icebreaker',
  'message_sent',
  'imagined_conversation',
  'goal_summary',
  'resume_feedback',
  'document_intake',
]);

let counter = 0;
const uid = () => `b${Date.now().toString(36)}${(counter++).toString(36)}`;

export function useSpark() {
  const qc = useQueryClient();
  const [blocks, setBlocks] = useState<SparkBlock[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [activity, setActivity] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const history = useRef<SparkChatMessage[]>([]);
  const sessionId = useRef<string | undefined>(undefined);
  const abort = useRef<AbortController | null>(null);
  const assistantBlock = useRef<string | null>(null);
  const assistantText = useRef('');

  const handle = useCallback(
    (e: SseEvent) => {
      const data = (e.data ?? {}) as Record<string, unknown>;
      switch (e.event) {
        case 'ready':
          if (typeof data.session_id === 'string') sessionId.current = data.session_id;
          break;
        case 'text': {
          const delta = typeof data.delta === 'string' ? data.delta : '';
          if (!delta) break;
          setActivity(null);
          assistantText.current += delta;
          const existing = assistantBlock.current;
          if (existing) {
            setBlocks((b) => b.map((x) => (x.id === existing && x.kind === 'assistant' ? { ...x, text: x.text + delta } : x)));
          } else {
            const id = uid();
            assistantBlock.current = id;
            setBlocks((b) => [...b, { id, kind: 'assistant', text: delta }]);
          }
          break;
        }
        case 'suggestions': {
          const chips = Array.isArray(data.chips) ? (data.chips as SparkChip[]) : [];
          if (chips.length) setBlocks((b) => [...b.filter((x) => x.kind !== 'suggestions'), { id: uid(), kind: 'suggestions', chips }]);
          break;
        }
        case 'tool_call': {
          const name = typeof data.name === 'string' ? data.name : typeof data.tool === 'string' ? data.tool : '';
          setActivity(TOOL_LABELS[name] ?? 'Working on it…');
          break;
        }
        case 'error':
          setError(typeof data.message === 'string' ? data.message : 'Spark hit a snag. Tap send to retry.');
          break;
        default:
          if (CARD_EVENTS.has(e.event)) {
            assistantBlock.current = null;
            setActivity(null);
            setBlocks((b) => [...b, { id: uid(), kind: 'card', event: e.event, data }]);
            if (e.event === 'message_sent') qc.invalidateQueries({ queryKey: qk.conversations });
          }
      }
    },
    [qc],
  );

  const run = useCallback(async () => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    assistantBlock.current = null;
    assistantText.current = '';
    setStreaming(true);
    setError(null);
    setActivity('Thinking…');
    let failed = false;
    try {
      const res = await streamPost(agentApi.chatPath, { messages: history.current, session_id: sessionId.current }, controller.signal);
      if (!res.ok || !res.body) {
        failed = true;
        setError(
          res.status === 401 || res.status === 403
            ? 'Your session expired. Sign in again.'
            : `Spark hit a snag (${res.status}). Tap send to retry.`,
        );
        return;
      }
      await readSseStream(res.body as ReadableStream<Uint8Array>, handle, controller.signal);
    } catch {
      if (controller.signal.aborted) return;
      failed = true;
      setError('The connection dropped. Tap send to retry.');
    } finally {
      if (abort.current === controller) {
        setStreaming(false);
        setActivity(null);
        abort.current = null;
      }
      if (!failed && assistantText.current.trim()) {
        history.current.push({ role: 'assistant', content: assistantText.current });
      }
    }
  }, [handle]);

  const send = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t || streaming) return;
      history.current.push({ role: 'user', content: t });
      setBlocks((b) => [...b.filter((x) => x.kind !== 'suggestions'), { id: uid(), kind: 'user', text: t }]);
      run();
    },
    [run, streaming],
  );

  // Restore the latest session; if there is none, ask Spark for its greeting (web behaviour).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const latest = await agentApi.latestSession();
        if (cancelled) return;
        sessionId.current = latest.session_id ?? undefined;
        const msgs = (latest.interactions ?? [])
          .filter((i) => i.type === 'message' && (i.details.role === 'user' || i.details.role === 'assistant') && i.details.content)
          .map((i) => ({ role: i.details.role as 'user' | 'assistant', content: i.details.content as string }));
        history.current = msgs;
        setBlocks(msgs.map((m) => ({ id: uid(), kind: m.role, text: m.content })));
        setLoadingHistory(false);
        if (!msgs.length) run();
      } catch {
        if (cancelled) return;
        setLoadingHistory(false);
        run();
      }
    })();
    return () => {
      cancelled = true;
      abort.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retry = useCallback(() => {
    if (!streaming) run();
  }, [run, streaming]);

  return { blocks, streaming, activity, error, loadingHistory, send, retry };
}
