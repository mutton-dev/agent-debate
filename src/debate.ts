import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, buildUserMessage, type DebateRole, type Round } from './persona.js';

export interface DebateTurn {
  role: DebateRole;
  content: string;
  round: number;
}

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1024;

export async function runDebateTurn(
  client: Anthropic,
  role: DebateRole,
  topic: string,
  round: number,
  priorRounds: Round[]
): Promise<DebateTurn> {
  const system = buildSystemPrompt(role);
  const userMessage = buildUserMessage(topic, round, priorRounds);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = extractText(response.content);
  return { role, content: text, round };
}

function extractText(content: Array<{ type: string; text?: string }>): string {
  return content
    .filter((block): block is { type: 'text'; text: string } => block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text)
    .join('\n')
    .trim();
}

