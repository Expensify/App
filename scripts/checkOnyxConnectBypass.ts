#!/usr/bin/env bun

import {file} from 'bun';
/**
 * Fails the lint run when a new inline `eslint-disable` silences one of the bans in `BANNED_RULES`
 * (see `onyxConnectBypass.ts`).
 *
 * The ban (`rulesdir/no-onyx-connect`, shipped by eslint-config-expensify) is a normal lint rule,
 * so an inline disable can silence it. The runner re-elevates those disables by scanning source
 * for directives that name the ban or blanket directives that cover a real call — no disable
 * comment can reach this check.
 *
 * A real bypass requires a file to mention `Onyx` and `connect` and contain an `eslint-disable`
 * directive, so we first narrow the targets to files matching all three (via git grep). The
 * candidate scan does not require the contiguous text `Onyx.connect` — git grep is line-oriented, so a
 * spaced or split `Onyx . connect(` would otherwise be skipped. Extra matches like
 * `Onyx.connectWithoutView` are harmless: we only fail on disable directives that actually
 * suppress the ban.
 */
import {execFileSync} from 'node:child_process';
import path from 'node:path';

import type {BannedRule} from './onyxConnectBypass';

import {BANNED_RULES, collectDisableDirectivesFromSource, findNewBypasses} from './onyxConnectBypass';

const projectRoot = path.resolve(import.meta.dir, '..');

/** Files among the lint targets that mention every one of `searchTerms`. */
function findCandidateFiles(targets: string[], searchTerms: string[]): string[] {
    const pathSpecs = targets.length > 0 ? targets : ['.'];
    try {
        const output = execFileSync('git', ['grep', '-lI', '--all-match', '--untracked', '--no-recurse-submodules', ...searchTerms.flatMap((term) => ['-e', term]), '--', ...pathSpecs], {
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
 * Checks `targets` for new bypasses of `ban`, reporting any to stderr.
 * Returns `true` if a new bypass was found.
 */
async function checkBan(targets: string[], ban: BannedRule): Promise<boolean> {
    const candidates = findCandidateFiles(targets, ban.searchTerms)
        .map((relativePath) => relativePath.split(path.sep).join('/'))
        .filter(ban.appliesTo);
    if (candidates.length === 0) {
        return false;
    }

    const suppressed = (
        await Promise.all(
            candidates.map(async (relativePath) => {
                const source = await file(path.join(projectRoot, relativePath)).text();
                return collectDisableDirectivesFromSource(source, relativePath, ban);
            }),
        )
    ).flat();

    const newBypasses = findNewBypasses(suppressed, ban);
    if (newBypasses.length === 0) {
        return false;
    }

    console.error(ban.message);
    console.error('New bypasses found:');
    for (const bypass of newBypasses) {
        console.error(`  ${bypass.file}:${bypass.line}`);
    }
    return true;
}

async function checkOnyxConnectBypass(targets: string[]): Promise<boolean> {
    const results = await Promise.all(BANNED_RULES.map((ban) => checkBan(targets, ban)));
    return results.some(Boolean);
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
