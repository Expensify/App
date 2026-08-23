#!/usr/bin/env bun

import {file} from 'bun';
/**
 * Fails the lint run when a new inline `eslint-disable` bypasses the Onyx.connect() ban.
 *
 * The ban (`rulesdir/no-onyx-connect`, shipped by eslint-config-expensify) is a normal lint rule,
 * so an inline disable can silence it. The runner re-elevates those disables by scanning source
 * for directives that name the ban or blanket directives that cover a real call — no disable
 * comment can reach this check.
 *
 * A real bypass requires a file to contain both an `Onyx.connect` reference and an `eslint-disable`
 * directive, so we first narrow the targets to files matching both (via git grep). The `Onyx.connect`
 * match deliberately omits the `(` so it stays a superset of the AST rule; extra matches like
 * `Onyx.connectWithoutView` are harmless, as we only fail on disable directives that name the ban.
 */
import {execFileSync} from 'node:child_process';
import path from 'node:path';

import {collectDisableDirectivesFromSource, findNewBypasses} from './onyxConnectBypass';

const projectRoot = path.resolve(import.meta.dir, '..');

/** Files among the lint targets that contain both an Onyx.connect() call and an eslint-disable. */
function findCandidateFiles(targets: string[]): string[] {
    const pathSpecs = targets.length > 0 ? targets : ['.'];
    try {
        const output = execFileSync('git', ['grep', '-lI', '-F', '--all-match', '--untracked', '--no-recurse-submodules', '-e', 'Onyx.connect', '-e', 'eslint-disable', '--', ...pathSpecs], {
            cwd: projectRoot,
            encoding: 'utf8',
        });
        return output.split('\n').filter(Boolean);
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'status' in error && error.status === 1) {
            return [];
        }
        throw error;
    }
}

/**
 * Checks `targets` for new Onyx.connect() ban bypasses, reporting any to stderr.
 * Returns `true` if a new bypass was found (i.e. the caller should fail).
 */
async function checkOnyxConnectBypass(targets: string[]): Promise<boolean> {
    const candidates = findCandidateFiles(targets);
    if (candidates.length === 0) {
        return false;
    }

    const suppressed = (
        await Promise.all(
            candidates.map(async (relativePath) => {
                const source = await file(path.join(projectRoot, relativePath)).text();
                return collectDisableDirectivesFromSource(source, relativePath.split(path.sep).join('/'));
            }),
        )
    ).flat();

    const newBypasses = findNewBypasses(suppressed);
    if (newBypasses.length === 0) {
        return false;
    }

    console.error('Onyx.connect() is banned and the ban cannot be bypassed with eslint-disable. Use the useOnyx() hook to read Onyx data instead.');
    console.error('New bypasses found:');
    for (const bypass of newBypasses) {
        console.error(`  ${bypass.file}:${bypass.line}`);
    }
    return true;
}

if (import.meta.main) {
    checkOnyxConnectBypass(process.argv.slice(2))
        .then((failed) => {
            if (!failed) {
                return;
            }
            process.exitCode = 1;
        })
        .catch((error: unknown) => {
            console.error(error instanceof Error ? error.message : error);
            process.exitCode = 1;
        });
}

export default checkOnyxConnectBypass;
