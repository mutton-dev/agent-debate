export interface CliArgs {
  topic: string;
  rounds: number;
}

export function parseArgs(argv: string[]): CliArgs {
  let topic: string | undefined;
  let rounds = 3;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--rounds') {
      const next = argv[i + 1];
      const parsed = Number(next);
      if (!Number.isInteger(parsed) || Number.isNaN(parsed)) {
        throw new Error(`Invalid --rounds value: ${next}`);
      }
      if (parsed < 1 || parsed > 10) {
        throw new Error(`--rounds must be between 1 and 10 (got ${parsed})`);
      }
      rounds = parsed;
      i++;
    } else if (arg === '--help' || arg === '-h') {
      throw new Error(
        'Usage: agent-debate "<topic>" [--rounds N]\n  --rounds N   Number of rounds (1-10, default 3)'
      );
    } else if (!topic) {
      topic = arg;
    }
  }

  if (!topic) {
    throw new Error('Missing required topic argument. Usage: agent-debate "<topic>" [--rounds N]');
  }
  return { topic, rounds };
}

export function validateEnv(env: Record<string, string | undefined>): string {
  const key = env.ANTHROPIC_API_KEY;
  if (!key || key.length === 0) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Export it before running agent-debate.'
    );
  }
  return key;
}
