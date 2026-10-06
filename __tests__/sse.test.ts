import { parseSseBuffer, readSseStream } from '@/services/sse';

describe('SSE parser', () => {
  it('parses complete events and keeps the remainder', () => {
    const buf = 'event: ready\ndata: {"session_id":"s1"}\n\nevent: text\ndata: {"delta":"Hi"}\n\nevent: text\ndata: {"del';
    const { events, rest } = parseSseBuffer(buf);
    expect(events).toEqual([
      { event: 'ready', data: { session_id: 's1' } },
      { event: 'text', data: { delta: 'Hi' } },
    ]);
    expect(rest).toBe('event: text\ndata: {"del');
  });

  it('handles CRLF and non-JSON data', () => {
    const { events } = parseSseBuffer('event: note\r\ndata: plain text\r\n\r\n');
    expect(events).toEqual([{ event: 'note', data: 'plain text' }]);
  });

  it('defaults the event name to "message"', () => {
    expect(parseSseBuffer('data: {"a":1}\n\n').events[0]).toEqual({ event: 'message', data: { a: 1 } });
  });

  it('reads a chunked stream across boundaries', async () => {
    const enc = new TextEncoder();
    const chunks = ['event: text\ndata: {"delta":"He', 'llo"}\n\nevent: done\n', 'data: {}\n\n'];
    let i = 0;
    const body = {
      getReader: () => ({
        read: async () => (i < chunks.length ? { done: false, value: enc.encode(chunks[i++]) } : { done: true, value: undefined }),
        cancel: async () => {},
      }),
    } as unknown as ReadableStream<Uint8Array>;
    const seen: string[] = [];
    await readSseStream(body, (e) => seen.push(`${e.event}:${JSON.stringify(e.data)}`));
    expect(seen).toEqual(['text:{"delta":"Hello"}', 'done:{}']);
  });
});
