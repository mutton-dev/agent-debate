import { describe, it, expect } from 'vitest';
import { extractText, sanitizeError } from '../src/util.js';

describe('extractText', () => {
  it('joins text blocks', () => {
    const result = extractText([
      { type: 'text', text: 'hello' },
      { type: 'text', text: 'world' },
    ]);
    expect(result).toBe('hello\nworld');
  });

  it('skips non-text blocks', () => {
    const result = extractText([
      { type: 'tool_use', id: 'x' } as never,
      { type: 'text', text: 'actual' },
    ]);
    expect(result).toBe('actual');
  });

  it('trims surrounding whitespace', () => {
    expect(extractText([{ type: 'text', text: '  hi  ' }])).toBe('hi');
  });

  it('returns empty string for empty content', () => {
    expect(extractText([])).toBe('');
  });
});

describe('sanitizeError', () => {
  it('replaces API key with [REDACTED]', () => {
    const msg = 'Authentication failed: sk-ant-abc123 is invalid';
    expect(sanitizeError(msg, 'sk-ant-abc123')).toBe(
      'Authentication failed: [REDACTED] is invalid',
    );
  });

  it('replaces all occurrences', () => {
    const key = 'secret';
    const msg = 'key=secret err=secret';
    expect(sanitizeError(msg, key)).toBe('key=[REDACTED] err=[REDACTED]');
  });

  it('returns message unchanged when apiKey is empty', () => {
    const msg = 'some error';
    expect(sanitizeError(msg, '')).toBe('some error');
  });

  it('returns message unchanged when key is not present', () => {
    expect(sanitizeError('no key here', 'sk-xyz')).toBe('no key here');
  });
});
