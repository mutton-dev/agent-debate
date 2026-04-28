export type DebateRole = 'proponent' | 'opponent' | 'neutral';

export interface Round {
  role: DebateRole;
  content: string;
  round: number;
}

const SYSTEM_PROMPTS: Record<DebateRole, string> = {
  proponent:
    'You are a passionate advocate. Argue strongly in favor of the topic. ' +
    'Build the most compelling case you can, marshal evidence, and concede only when forced to. ' +
    'Stay focused on the strongest reasons to support the position.',
  opponent:
    'You are a critical skeptic. Challenge every assumption behind the topic. ' +
    'Surface hidden costs, edge cases, and failure modes. ' +
    'Argue against the position rigorously and refuse to grant unearned premises.',
  neutral:
    'You are a wise mediator. Seek synthesis between competing views and highlight nuance. ' +
    'Identify what both sides get right, what they miss, and where a thoughtful person would land. ' +
    'Aim for clarity over compromise.',
};

export function buildSystemPrompt(role: DebateRole): string {
  return SYSTEM_PROMPTS[role];
}

export function buildUserMessage(
  topic: string,
  round: number,
  priorRounds: Round[]
): string {
  const header = `Topic: ${topic}\nRound: ${round}`;
  if (priorRounds.length === 0) {
    return `${header}\n\nGive your opening argument. Be concrete and specific.`;
  }
  const transcript = priorRounds
    .map((r) => `[${r.role.toUpperCase()} round ${r.round}] ${r.content}`)
    .join('\n\n');
  return `${header}\n\nPrior arguments:\n${transcript}\n\nRespond to the prior arguments and advance your position for round ${round}.`;
}
