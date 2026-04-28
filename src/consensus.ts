import Anthropic from '@anthropic-ai/sdk';
import type { DebateTurn } from './debate.js';

export interface ConsensusResult {
  summary: string;
  dissentingPoints: string[];
  confidence: {
    proponent: number;
    opponent: number;
    neutral: number;
  };
}

const JUDGE_SYSTEM_PROMPT =
  'You are an impartial debate judge. After reading a structured debate, ' +
  'produce a calibrated verdict that highlights genuine consensus, surviving disagreements, ' +
  'and how confident each role appeared in their position. ' +
  'Always respond with strict JSON matching the requested schema. No prose outside JSON.';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 1024;

export async function extractConsensus(
  turns: DebateTurn[],
  topic: string,
  apiKey: string
): Promise<ConsensusResult> {
  const client = new Anthropic({ apiKey });
  const transcript = turns
    .map((t) => `[${t.role.toUpperCase()} round ${t.round}] ${t.content}`)
    .join('\n\n');

  const userMessage =
    `Topic: ${topic}\n\nDebate transcript:\n${transcript}\n\n` +
    'Respond with JSON only matching this exact shape: ' +
    '{ "summary": string (1-3 sentences of consensus), ' +
    '"dissentingPoints": string[] (remaining disagreements), ' +
    '"confidence": { "proponent": number 0-100, "opponent": number 0-100, "neutral": number 0-100 } }';

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: JUDGE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const raw = response.content
    .filter((b: { type: string; text?: string }) => b.type === 'text' && typeof b.text === 'string')
    .map((b: { text?: string }) => b.text as string)
    .join('\n')
    .trim();

  return parseConsensus(raw);
}

export function parseConsensus(raw: string): ConsensusResult {
  const stripped = stripFences(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch (err) {
    throw new Error(`Failed to parse consensus JSON: ${(err as Error).message}`);
  }
  if (!isConsensusResult(parsed)) {
    throw new Error('Consensus response missing required fields');
  }
  return parsed;
}

function stripFences(text: string): string {
  const fenced = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenced) return fenced[1].trim();
  return text;
}

function isConsensusResult(v: unknown): v is ConsensusResult {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  if (typeof o.summary !== 'string') return false;
  if (!Array.isArray(o.dissentingPoints)) return false;
  if (!o.dissentingPoints.every((d) => typeof d === 'string')) return false;
  const c = o.confidence as Record<string, unknown> | undefined;
  if (!c || typeof c !== 'object') return false;
  return (
    typeof c.proponent === 'number' &&
    typeof c.opponent === 'number' &&
    typeof c.neutral === 'number'
  );
}
