#!/usr/bin/env bun

import {file} from 'bun';
/**
 * Fails the lint run when a new inline `eslint-disable`, `oxlint-disable` or `eslint` config comment silences one of
 * the Onyx lint bans in `BANNED_RULES` (see `onyxLintBypass.ts`). Every ban there is a normal lint
 * rule, so oxlint honors an inline comment that turns it off. This script reads the source itself and
 * reports directives that name the ban, blanket directives over a real banned use, and config comments
 * that name the ban. For the OnyxUtils ban a named directive or config comment counts only when the
 * file has a runtime import. The script runs outside oxlint, so no disable comment can turn it off.
 *
 * A bypass needs an `eslint` or `oxlint` comment and the ban's search terms in the same file, so git grep first
 * narrows the targets to files that contain all of them. The terms are separate words rather than
 * `Onyx.connect`, because git grep matches one line at a time and would miss a call split across lines
 * or spaced as `Onyx . connect(`. Extra matches such as `Onyx.connectWithoutView` are harmless, since
 * only a directive that silences a real use fails the run.
 *
 * It also fails when the seatbelt TSV has a row for a rule in `SEATBELT_FORBIDDEN_RULES`, since such a row allows the
 * rule's errors the same way a disable comment would. A row is not tied to the lint targets, so this check runs on every call.
 */
import {execFileSync} from 'node:child_process';
import path from 'node:path';

import type {BannedRule} from './onyxLintBypass';

import {SEATBELT_TSV_RELATIVE} from './lint/processors/Seatbelt';
import {BANNED_RULES, collectDisableDirectivesFromSource, findForbiddenSeatbeltRows, findNewBypasses, SEATBELT_FORBIDDEN_RULES} from './onyxLintBypass';

const projectRoot = path.resolve(import.meta.dir, '..');

/** Repo-relative paths of the files under `targets` that match every search term, each an extended regex. An empty `targets` searches the whole repo. */
function findCandidateFiles(targets: string[], searchTerms: string[]): string[] {
    const pathSpecs = targets.length > 0 ? targets : ['.'];
    try {
        const output = execFileSync('git', ['grep', '-lIE', '--all-match', '--untracked', '--no-recurse-submodules', ...searchTerms.flatMap((term) => ['-e', term]), '--', ...pathSpecs], {
            cwd: projectRoot,
            encoding: 'utf8',
        });
        return output.split('\n').filter(Boolean);
    } catch (error: unknown) {
        // git grep exits with status 1 when no file matches
        if (typeof error === 'object' && error !== null && 'status' in error && error.status === 1) {
            return [];
        }
        throw error;
    }
}

/** Prints each new bypass to stderr and resolves to `true` when there is one. */
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

/** Prints each forbidden row to stderr and resolves to `true` when there is one. A missing TSV passes. */
async function checkSeatbelt(): Promise<boolean> {
    const tsvFile = file(path.join(projectRoot, SEATBELT_TSV_RELATIVE));
    if (!(await tsvFile.exists())) {
        return false;
    }
    const forbiddenRows = findForbiddenSeatbeltRows(await tsvFile.text(), SEATBELT_FORBIDDEN_RULES);
    if (forbiddenRows.length === 0) {
        return false;
    }

    console.error(
        `${SEATBELT_TSV_RELATIVE} has a row for ${SEATBELT_FORBIDDEN_RULES.join(' or ')}. A seatbelt row allows the rule's errors in that file, the same as a disable comment. Remove the row and fix the reads it covers; SEATBELT_INCREASE must not be used for these rules.`,
    );
    console.error('Forbidden seatbelt rows found:');
    for (const row of forbiddenRows) {
        console.error(`  ${SEATBELT_TSV_RELATIVE}:${row.line}  ${path.posix.normalize(path.posix.join(path.posix.dirname(SEATBELT_TSV_RELATIVE), row.file))}  ${row.rule}`);
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
