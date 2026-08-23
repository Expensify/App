#!/usr/bin/env bun

/**
 * Lint runner: spawn a linter as a JSON producer, then apply the post-process
 * pipeline (react-compiler filter, no-deprecated stratify, seatbelt ratchet)
 * as pure transforms over the message list.
 *
 *   bun scripts/lint/index.ts                      -> lint the whole repo
 *   bun scripts/lint/index.ts src/foo.ts ...       -> lint just the given paths
 *   bun scripts/lint/index.ts --show-warnings ...  -> include grandfathered seatbelt warnings
 *   bun scripts/lint/index.ts --dump-raw out.json  -> write unprocessed linter JSON and stop
 *   bun scripts/lint/index.ts --from-raw out.json  -> skip the linter; post-process a captured dump
 *   bun scripts/lint/index.ts --timings            -> print per-stage wall times
 */

import checkOnyxConnectBypass from '../checkOnyxConnectBypass';
import Bench from '../utils/Bench';
import {parseCliArgs, resolveSeatbeltOptions} from './args';
import {runEslint} from './eslint';
import {dumpRawToFile, loadRawFromFile, runPostprocess} from './pipeline';

const projectRoot = `${import.meta.dir}/../..`;

const cli = parseCliArgs();
const bench = new Bench();
const seatbeltOptions = resolveSeatbeltOptions(projectRoot);

const fromRawPath = cli.fromRawPath;
const raw =
    fromRawPath !== undefined
        ? await bench.measure('load-raw', () => loadRawFromFile(fromRawPath))
        : await bench.measure('eslint', () =>
              runEslint({
                  projectRoot,
                  targets: cli.lintTargets,
                  useCache: cli.useCache,
                  fix: cli.fix,
              }),
          );

if (cli.dumpRawPath) {
    await dumpRawToFile(cli.dumpRawPath, raw);
    if (cli.showTimings) {
        console.error(bench.format('lint timings'));
    }
    if (raw.linterExitCode > 1) {
        if (raw.stderr.trim()) {
            console.error(raw.stderr.trim());
        }
        process.exit(raw.linterExitCode);
    }
    process.exit(0);
}

const result = await runPostprocess({raw, options: seatbeltOptions, showWarnings: cli.showWarnings, bench});

if (raw.stderr.trim() && raw.linterExitCode > 1) {
    console.error(raw.stderr.trim());
}

if (result.reportText) {
    console.log(result.reportText);
}

if (cli.showTimings) {
    console.error(bench.format('lint timings'));
}

if (result.exitCode !== 0) {
    process.exit(result.exitCode);
}

if (fromRawPath === undefined && (await checkOnyxConnectBypass(cli.lintTargets))) {
    process.exit(1);
}
