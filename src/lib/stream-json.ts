/**
 * Incremental JSON object extractor for streaming LLM responses.
 *
 * The model streams arrays of objects like `[{...},{...},{...}]`, sometimes
 * fenced in ```json ... ``` blocks. Instead of waiting for the full array
 * to finish, we scan the growing buffer for objects whose braces have
 * already balanced, and hand them out one at a time so the UI can render
 * each item the moment it's ready.
 *
 * Usage:
 *   let cursor = 0;
 *   while (streaming) {
 *     buffer += decoder.decode(chunk);
 *     const out = extractStreamedObjects(buffer, cursor);
 *     cursor = out.cursor;
 *     for (const obj of out.items) render(obj);
 *   }
 */
export function extractStreamedObjects<T = unknown>(
  buffer: string,
  cursor: number,
): { items: T[]; cursor: number } {
  const items: T[] = [];
  let i = cursor;

  // First call — seek forward to the opening '[' of the array. Anything before
  // that (leading prose, ```json fence, whitespace) is skipped.
  if (i === 0) {
    const arrStart = buffer.indexOf('[');
    if (arrStart === -1) return { items, cursor: 0 };
    i = arrStart + 1;
  }

  while (i < buffer.length) {
    // Skip whitespace and commas between objects
    while (i < buffer.length && (buffer[i] === ' ' || buffer[i] === '\n' || buffer[i] === '\r' || buffer[i] === '\t' || buffer[i] === ',')) {
      i++;
    }
    if (i >= buffer.length) break;
    // End of array — done
    if (buffer[i] === ']') {
      i++;
      break;
    }
    if (buffer[i] !== '{') {
      // Unexpected character — advance to avoid an infinite loop.
      i++;
      continue;
    }

    // Walk the object, tracking depth and respecting strings+escapes.
    const start = i;
    let depth = 0;
    let inString = false;
    let escape = false;
    let end = -1;
    for (let j = i; j < buffer.length; j++) {
      const ch = buffer[j];
      if (inString) {
        if (escape) {
          escape = false;
        } else if (ch === '\\') {
          escape = true;
        } else if (ch === '"') {
          inString = false;
        }
      } else {
        if (ch === '"') inString = true;
        else if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
          if (depth === 0) {
            end = j;
            break;
          }
        }
      }
    }

    if (end === -1) {
      // Object hasn't fully arrived yet — rewind cursor to the object start
      // so the next call picks up here.
      return { items, cursor: start };
    }

    const chunk = buffer.slice(start, end + 1);
    try {
      items.push(JSON.parse(chunk) as T);
    } catch {
      // Malformed — skip silently rather than break the stream.
    }
    i = end + 1;
  }

  return { items, cursor: i };
}
