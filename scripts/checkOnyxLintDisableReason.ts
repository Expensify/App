#!/usr/bin/env bun

import {file} from 'bun';
/**
 * Fails the lint run when an inline `eslint-disable` or `oxlint-disable` of one of the rules in `REASONED_RULES` (see
 * `onyxLintDisableReason.ts`) gives no reason, or an `eslint` config comment names one of them.
 * git grep narrows the candidate files the same way it does in `checkOnyxLintBypass.ts`, then the
 * script checks each comment Babel finds.
 */
import path from 'node:path';

import type {ReasonedRule} from './onyxLintDisableReason';

import {findCandidateFiles} from './checkOnyxLintBypass';
import {REASONED_RULES, collectUnreasonedDisables} from './onyxLintDisableReason';

const projectRoot = path.resolve(import.meta.dir, '..');

/** Prints each disable without a reason to stderr and resolves to `true` when there is one. */
async function checkRule(targets: string[], rule: ReasonedRule): Promise<boolean> {
    const candidates = findCandidateFiles(targets, rule.searchTerms)
        .map((relativePath) => relativePath.split(path.sep).join('/'))
        .filter(rule.appliesTo);
    if (candidates.length === 0) {
        return false;
    }

    const unreasoned = (
        await Promise.all(
            candidates.map(async (relativePath) => {
                const source = await file(path.join(projectRoot, relativePath)).text();
                return collectUnreasonedDisables(source, relativePath, rule);
            }),
        )
    ).flat();
    if (unreasoned.length === 0) {
        return false;
    }

    console.error(rule.message);
    console.error('Disables without a reason found:');
    for (const disable of unreasoned) {
        console.error(`  ${disable.file}:${disable.line}`);
    }
    return true;
}

async function checkOnyxLintDisableReason(targets: string[]): Promise<boolean> {
    const results = await Promise.all(REASONED_RULES.map((rule) => checkRule(targets, rule)));
    return results.some(Boolean);
}

if (import.meta.main) {
    checkOnyxLintDisableReason(process.argv.slice(2))
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

export default checkOnyxLintDisableReason;
