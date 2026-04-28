import { describe, it, expect } from 'vitest';
import { parseArgs, validateEnv } from '../src/cli.js';

describe('parseArgs', () => {
  it('extracts the topic positional argument', () => {
    const result = parseArgs(['Should we adopt Remix?']);
    expect(result.topic).toBe('Should we adopt Remix?');
    expect(result.rounds).toBe(3);
  });

  it('parses --rounds flag', () => {
    const result = parseArgs(['Topic', '--rounds', '5']);
    expect(result.topic).toBe('Topic');
    expect(result.rounds).toBe(5);
  });

  it('throws when topic is missing', () => {
    expect(() => parseArgs([])).toThrow(/topic/i);
  });

  it('throws on invalid rounds value', () => {
    expect(() => parseArgs(['Topic', '--rounds', 'abc'])).toThrow();
  });

  it('rejects rounds out of 1-10 range', () => {
    expect(() => parseArgs(['T', '--rounds', '0'])).toThrow();
    expect(() => parseArgs(['T', '--rounds', '11'])).toThrow();
  });
});

describe('validateEnv', () => {
  it('returns the API key when ANTHROPIC_API_KEY is set', () => {
    const key = validateEnv({ ANTHROPIC_API_KEY: 'sk-test-123' });
    expect(key).toBe('sk-test-123');
  });

  it('throws a clear error when ANTHROPIC_API_KEY is missing', () => {
    expect(() => validateEnv({})).toThrow(/ANTHROPIC_API_KEY/);
  });

  it('throws when ANTHROPIC_API_KEY is empty', () => {
    expect(() => validateEnv({ ANTHROPIC_API_KEY: '' })).toThrow(/ANTHROPIC_API_KEY/);
  });
});
