#!/usr/bin/env bun

/**
 * Finishes tightening the eslint-seatbelt baseline after a full-repo lint run.
 *
 * `npm run lint` already ratchets down max-error counts for rules that now pass, but
 * eslint-seatbelt only ever touches rows for files ESLint actually visits. A deleted or
 * renamed file is simply absent from that run, so its row lingers in the baseline forever
 * (a dead-code gap in eslint-seatbelt itself: https://github.com/justjake/eslint-seatbelt/issues/15).
 * This closes that gap by dropping baseline rows whose file no longer exists on disk.
 *
 * Run on push to main, after `npm run lint`, so the result rides along with the existing
 * OSBotify auto-commit of config/eslint/eslint.seatbelt.tsv (see .github/workflows/lint.yml).
 */
import {SeatbeltArgs, SeatbeltFile} from 'eslint-seatbelt/api';
import fs from 'node:fs';
import path from 'node:path';

const seatbeltPath = path.resolve(__dirname, '../config/eslint/eslint.seatbelt.tsv');
const seatbeltFile = SeatbeltFile.readSync(seatbeltPath);
const args = SeatbeltArgs.fromConfig({frozen: false});

let removedCount = 0;
for (const filename of Array.from(seatbeltFile.filenames())) {
    if (!fs.existsSync(filename) && seatbeltFile.removeFile(filename, args)) {
        removedCount++;
    }
}

if (removedCount > 0) {
    seatbeltFile.writeSync();
}

console.log(`eslint-seatbelt: removed ${removedCount} baseline row(s) for deleted files`);
