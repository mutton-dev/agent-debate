export function extractText(content: Array<{ type: string; text?: string }>): string {
  return content
    .filter((block): block is { type: 'text'; text: string } =>
      block.type === 'text' && typeof block.text === 'string',
    )
    .map((block) => block.text)
    .join('\n')
    .trim();
}

export function sanitizeError(msg: string, apiKey: string): string {
  if (!apiKey) return msg;
  return msg.replaceAll(apiKey, '[REDACTED]');
}
