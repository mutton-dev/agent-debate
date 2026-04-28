import React, { useEffect, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import type { DebateRole } from './persona.js';
import { runDebate } from './debate.js';
import { extractConsensus } from './consensus.js';
import {
  appendTurn,
  createInitialState,
  setConsensus,
  setError,
  type DebateState,
} from './state.js';

interface AppProps {
  topic: string;
  rounds: number;
  apiKey: string;
}

const ROLE_LABEL: Record<DebateRole, { color: string; icon: string; name: string }> = {
  proponent: { color: 'green', icon: '🟢', name: 'PROPONENT' },
  opponent: { color: 'red', icon: '🔴', name: 'OPPONENT' },
  neutral: { color: 'yellow', icon: '🟡', name: 'NEUTRAL' },
};

export function App({ topic, rounds, apiKey }: AppProps) {
  const { exit } = useApp();
  const [state, setState] = useState<DebateState>(() => createInitialState(topic, rounds));
  const [stopRequested, setStopRequested] = useState(false);

  useInput((input) => {
    if (input === 'q') {
      exit();
    } else if (input === 's') {
      setStopRequested(true);
    }
  });

  useEffect(() => {
    let cancelled = false;
    let stopped = false;
    (async () => {
      try {
        const collected: DebateState['turns'] = [];
        for await (const turn of runDebate(topic, rounds, apiKey)) {
          if (cancelled) return;
          collected.push(turn);
          setState((s) => appendTurn(s, turn));
          if (stopRequested) {
            stopped = true;
            break;
          }
        }
        if (cancelled) return;
        if (collected.length === 0) {
          setState((s) => setError(s, 'No turns produced.'));
          return;
        }
        const consensus = await extractConsensus(collected, topic, apiKey);
        if (cancelled) return;
        setState((s) => setConsensus(s, consensus));
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setState((s) => setError(s, msg));
      }
      void stopped;
    })();
    return () => {
      cancelled = true;
    };
  }, [topic, rounds, apiKey, stopRequested]);

  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      <Box>
        <Text bold>agent-debate</Text>
        <Text>  •  </Text>
        <Text>Topic: </Text>
        <Text color="cyan">{topic}</Text>
      </Box>
      <Box>
        <Text dimColor>
          Rounds {Math.min(currentRound(state), rounds)}/{rounds}  (q: quit, s: stop & synthesize)
        </Text>
      </Box>
      <Box flexDirection="column" marginTop={1}>
        {state.turns.map((t, i) => {
          const meta = ROLE_LABEL[t.role];
          return (
            <Box key={i} flexDirection="column" marginBottom={1}>
              <Text color={meta.color} bold>
                {meta.icon} {meta.name} (round {t.round})
              </Text>
              <Text>{t.content}</Text>
            </Box>
          );
        })}
        {state.status === 'thinking' && state.thinkingFor && (
          <Text dimColor>
            [thinking… {ROLE_LABEL[state.thinkingFor.role].icon} {ROLE_LABEL[state.thinkingFor.role].name} round {state.thinkingFor.round}]
          </Text>
        )}
        {state.status === 'synthesizing' && <Text dimColor>[synthesizing consensus…]</Text>}
        {state.status === 'done' && state.consensus && (
          <Box flexDirection="column" marginTop={1} borderStyle="single" paddingX={1}>
            <Text bold color="cyan">CONSENSUS</Text>
            <Text>{state.consensus.summary}</Text>
            {state.consensus.dissentingPoints.length > 0 && (
              <Box flexDirection="column" marginTop={1}>
                <Text bold>Dissenting points:</Text>
                {state.consensus.dissentingPoints.map((d, i) => (
                  <Text key={i}>• {d}</Text>
                ))}
              </Box>
            )}
            <Box marginTop={1}>
              <Text>
                confidence — proponent {state.consensus.confidence.proponent} / opponent{' '}
                {state.consensus.confidence.opponent} / neutral {state.consensus.confidence.neutral}
              </Text>
            </Box>
          </Box>
        )}
        {state.status === 'error' && (
          <Text color="red">Error: {state.error}</Text>
        )}
      </Box>
    </Box>
  );
}

function currentRound(state: DebateState): number {
  if (state.thinkingFor) return state.thinkingFor.round;
  if (state.turns.length === 0) return 1;
  return state.turns[state.turns.length - 1].round;
}
