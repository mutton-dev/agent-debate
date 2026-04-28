import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, buildUserMessage, type Round } from '../src/persona.js';

describe('buildSystemPrompt', () => {
  it('proponent prompt mentions advocate / favor', () => {
    const prompt = buildSystemPrompt('proponent');
    expect(prompt.toLowerCase()).toMatch(/advocate|favor/);
  });

  it('opponent prompt mentions skeptic / challenge', () => {
    const prompt = buildSystemPrompt('opponent');
    expect(prompt.toLowerCase()).toMatch(/skeptic|challenge/);
  });

  it('neutral prompt mentions mediator / synthesis', () => {
    const prompt = buildSystemPrompt('neutral');
    expect(prompt.toLowerCase()).toMatch(/mediator|synthesis/);
  });

  it('different roles produce different prompts', () => {
    const a = buildSystemPrompt('proponent');
    const b = buildSystemPrompt('opponent');
    const c = buildSystemPrompt('neutral');
    expect(a).not.toBe(b);
    expect(b).not.toBe(c);
    expect(a).not.toBe(c);
  });
});

describe('buildUserMessage', () => {
  const topic = 'Next.js vs Remix の選定';

  it('includes the topic', () => {
    const msg = buildUserMessage(topic, 1, []);
    expect(msg).toContain(topic);
  });

  it('first round (no priorRounds) does not include "Prior arguments"', () => {
    const msg = buildUserMessage(topic, 1, []);
    expect(msg).not.toMatch(/prior arguments/i);
  });

  it('subsequent round includes prior round contents', () => {
    const prior: Round[] = [
      { role: 'proponent', content: 'P1 argues for adoption.', round: 1 },
      { role: 'opponent', content: 'O1 raises concerns.', round: 1 },
    ];
    const msg = buildUserMessage(topic, 2, prior);
    expect(msg).toContain('P1 argues for adoption.');
    expect(msg).toContain('O1 raises concerns.');
    expect(msg.toLowerCase()).toMatch(/prior|previous/);
  });

  it('includes round number context', () => {
    const msg = buildUserMessage(topic, 3, []);
    expect(msg).toMatch(/3/);
  });
});
