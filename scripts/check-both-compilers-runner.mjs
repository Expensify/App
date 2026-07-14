#!/usr/bin/env node
/**
 * CLI wrapper for checkBothCompilers used by Jest tests (oxc-transform is ESM-only and
 * cannot be loaded directly in the Jest environment).
 *
 * Usage: node scripts/check-both-compilers-runner.mjs <filename> <sourcePath>
 */
import fs from 'node:fs';

import {checkBothCompilers} from '../config/reactCompiler/checkBoth.mjs';

const [filename, sourcePath] = process.argv.slice(2);
const source = fs.readFileSync(sourcePath, 'utf8');
process.stdout.write(JSON.stringify(checkBothCompilers(source, filename)));
