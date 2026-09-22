/** Strip markdown / formatting so chat bubbles show simple readable text. */
export function toPlainChatText(text) {
  if (typeof text !== 'string') return '';

  let out = text;

  out = out.replace(/```[\s\S]*?```/g, (block) =>
    block.replace(/^```[^\n]*\n?/, '').replace(/```$/, '').trim()
  );
  out = out.replace(/`([^`]+)`/g, '$1');
  out = out.replace(/\*\*([^*]+)\*\*/g, '$1');
  out = out.replace(/__([^_]+)__/g, '$1');
  out = out.replace(/\*([^*\n]+)\*/g, '$1');
  out = out.replace(/_([^_\n]+)_/g, '$1');
  out = out.replace(/^\s{0,3}#{1,6}\s+/gm, '');
  out = out.replace(/^\s*[-*+]\s+/gm, '');
  out = out.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  out = out.replace(/\*\*/g, '').replace(/__/g, '');

  return out.trim();
}
