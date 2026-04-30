import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, buildUserMessage, type DebateRole, type Round } from './persona.js';
import { extractText } from './util.js';

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


export async function* runDebate(
  topic: string,
  rounds: number,
  apiKey: string
): AsyncGenerator<DebateTurn> {
  const client = new Anthropic({ apiKey });
  const transcript: Round[] = [];
  const order: DebateRole[] = ['proponent', 'opponent', 'neutral'];

  for (let r = 1; r <= rounds; r++) {
    for (const role of order) {
      const turn = await runDebateTurn(client, role, topic, r, transcript);
      transcript.push({ role: turn.role, content: turn.content, round: turn.round });
      yield turn;
    }
  }
}

