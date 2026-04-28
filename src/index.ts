#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './app.js';
import { parseArgs, validateEnv } from './cli.js';

function main() {
  let args;
  let apiKey;
  try {
    args = parseArgs(process.argv.slice(2));
    apiKey = validateEnv(process.env);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`${msg}\n`);
    process.exit(1);
  }

  render(React.createElement(App, { topic: args.topic, rounds: args.rounds, apiKey }));
}

main();
