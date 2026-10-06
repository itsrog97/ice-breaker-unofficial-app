/**
 * Minimal Server-Sent Events parser matching the web client's behaviour for
 * POST /api/v1/agent/chat (events separated by a blank line, `event:` + `data:` lines,
 * JSON payloads).
 */

export interface SseEvent {
  event: string;
  data: unknown;
}

function parseBlock(block: string): SseEvent | null {
  let event = 'message';
  const data: string[] = [];
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) data.push(line.slice(5).trim());
  }
  if (data.length === 0) return null;
  const raw = data.join('\n');
  try {
    return { event, data: JSON.parse(raw) };
  } catch {
    return { event, data: raw };
  }
}

/** Splits a buffer into complete events plus the unconsumed remainder. */
export function parseSseBuffer(buffer: string): { events: SseEvent[]; rest: string } {
  const events: SseEvent[] = [];
  let rest = buffer.replace(/\r/g, '');
  let idx = rest.indexOf('\n\n');
  while (idx !== -1) {
    const parsed = parseBlock(rest.slice(0, idx));
    if (parsed) events.push(parsed);
    rest = rest.slice(idx + 2);
    idx = rest.indexOf('\n\n');
  }
  return { events, rest };
}

/** Reads a streaming body and invokes `onEvent` for each SSE event. */
export async function readSseStream(
  body: ReadableStream<Uint8Array>,
  onEvent: (e: SseEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    for (;;) {
      if (signal?.aborted) return;
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const { events, rest } = parseSseBuffer(buffer);
      buffer = rest;
      events.forEach(onEvent);
    }
    const tail = buffer.trim();
    if (tail) parseSseBuffer(`${tail}\n\n`).events.forEach(onEvent);
  } finally {
    if (signal?.aborted) reader.cancel().catch(() => {});
  }
}
