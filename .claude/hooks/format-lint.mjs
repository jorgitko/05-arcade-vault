#!/usr/bin/env node
/**
 * PostToolBatch hook: formats and lints the files touched by the tool batch.
 *
 * Claude Code sends the hook payload as JSON on stdin. There is no $HOOK_FILE
 * variable for PostToolBatch, so file paths are collected from the payload and
 * the hook exits quietly when the batch touched nothing lintable.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const LINTABLE = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const FORMATTABLE = new Set([
  ...LINTABLE,
  '.json',
  '.css',
  '.md',
  '.mdx',
  '.yml',
  '.yaml',
]);

const readStdin = () =>
  new Promise((resolve) => {
    let data = '';
    if (process.stdin.isTTY) return resolve('');
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(''));
  });

/** Walks the payload and collects every file path it can find. */
const collectPaths = (node, found = new Set()) => {
  if (!node) return found;
  if (Array.isArray(node)) {
    for (const item of node) collectPaths(item, found);
    return found;
  }
  if (typeof node !== 'object') return found;

  for (const [key, value] of Object.entries(node)) {
    if (
      typeof value === 'string' &&
      /^(file_path|notebook_path|path)$/.test(key)
    ) {
      found.add(value);
    } else {
      collectPaths(value, found);
    }
  }
  return found;
};

const run = (command, args) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  return result.status ?? 1;
};

const main = async () => {
  const raw = await readStdin();
  if (!raw.trim()) return 0;

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return 0;
  }

  const cwd = process.cwd();
  const files = [...collectPaths(payload)]
    .map((file) => path.resolve(cwd, file))
    .filter((file) => file.startsWith(cwd) && existsSync(file));

  const toFormat = files.filter((file) => FORMATTABLE.has(path.extname(file)));
  const toLint = files.filter((file) => LINTABLE.has(path.extname(file)));

  if (toFormat.length > 0) {
    const status = run('npx', [
      'prettier',
      '--write',
      '--ignore-unknown',
      ...toFormat,
    ]);
    if (status !== 0) return status;
  }

  if (toLint.length > 0) {
    return run('npx', ['eslint', '--fix', ...toLint]);
  }

  return 0;
};

process.exit(await main());
