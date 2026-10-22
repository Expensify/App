#!/usr/bin/env bun

import {file} from 'bun';
/**
 * Fails the lint run when a new inline `eslint-disable` or `eslint` config comment silences one of
 * the Onyx lint bans in `BANNED_RULES` (see `onyxLintBypass.ts`). Every ban there is a normal lint
 * rule, so an inline comment can silence it. The runner re-elevates those by scanning source for
 * directives that name the ban, blanket directives that cover a real banned use, and config comments
 * that name the ban. For the OnyxUtils ban a named directive or config comment counts only when the
 * file has a runtime import. No disable comment can reach this check.
 *
 * A real bypass requires a file to contain an `eslint` comment and the ban's search terms,
 * so we first narrow the targets to files matching all of them (via git grep). The candidate scan
 * does not require the contiguous text `Onyx.connect`: git grep is line-oriented, so a spaced or
 * split `Onyx . connect(` would otherwise be skipped. Extra matches like `Onyx.connectWithoutView`
 * are harmless: we only fail on disable directives that actually suppress a ban.
 *
 * It also fails when the seatbelt TSV has a row for a rule in `SEATBELT_FORBIDDEN_RULES`, since such a row allows the
 * rule's errors the same way a disable comment would. A row is global, so this runs whatever the lint targets are.
 */
import {execFileSync} from 'node:child_process';
import path from 'node:path';

import type {BannedRule} from './onyxLintBypass';

import {BANNED_RULES, collectDisableDirectivesFromSource, findForbiddenSeatbeltRows, findNewBypasses, SEATBELT_FORBIDDEN_RULES} from './onyxLintBypass';

const projectRoot = path.resolve(import.meta.dir, '..');

const SEATBELT_TSV = 'config/eslint/eslint.seatbelt.tsv';

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

/**
 * Checks the seatbelt TSV for rows that grandfather a rule in `SEATBELT_FORBIDDEN_RULES`, reporting any to stderr.
 * A missing TSV has no rows. Returns `true` if a forbidden row was found.
 */
async function checkSeatbelt(): Promise<boolean> {
    const tsvFile = file(path.join(projectRoot, SEATBELT_TSV));
    if (!(await tsvFile.exists())) {
        return false;
    }
    const forbiddenRows = findForbiddenSeatbeltRows(await tsvFile.text(), SEATBELT_FORBIDDEN_RULES);
    if (forbiddenRows.length === 0) {
        return false;
    }

    console.error(
        `${SEATBELT_FORBIDDEN_RULES.join(' and ')} cannot be grandfathered through the seatbelt ratchet (SEATBELT_INCREASE). Remove the row from ${SEATBELT_TSV} and fix the read instead.`,
    );
    console.error('Forbidden seatbelt rows found:');
    for (const row of forbiddenRows) {
        console.error(`  ${SEATBELT_TSV}:${row.line}  ${path.posix.normalize(path.posix.join(path.posix.dirname(SEATBELT_TSV), row.file))}  ${row.rule}`);
    }
    return true;
}

async function checkOnyxLintBypass(targets: string[]): Promise<boolean> {
    const results = await Promise.all([...BANNED_RULES.map((ban) => checkBan(targets, ban)), checkSeatbelt()]);
    return results.some(Boolean);
}

if (import.meta.main) {
    checkOnyxLintBypass(process.argv.slice(2))
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

export default checkOnyxLintBypass;
export {findCandidateFiles};
