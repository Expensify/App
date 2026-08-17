#!/usr/bin/env node
/**
 * CLI wrapper for checkReactCompilerWithOxc used by Jest tests (oxc-transform is ESM-only).
 *
 * Usage: node scripts/check-react-compiler-with-oxc-runner.mjs <filename> <sourcePath>
 */
import fs from 'node:fs';

import checkReactCompilerWithOxc from '../config/reactCompiler/checkWithOxc.mjs';

const [filename, sourcePath] = process.argv.slice(2);
const source = fs.readFileSync(sourcePath, 'utf8');
process.stdout.write(JSON.stringify(checkReactCompilerWithOxc(source, filename)));
