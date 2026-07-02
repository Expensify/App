#!/usr/bin/env ts-node

/**
 * Fails the lint run when a new inline `eslint-disable` bypasses the Onyx.connect() ban.
 *
 * The ban (`rulesdir/no-onyx-connect`, shipped by eslint-config-expensify) is a normal lint rule,
 * so an inline disable can silence it. The ESLint CLI neither surfaces nor fails on such suppressed
 * violations, so this runner re-elevates them: it lints with only the ban enabled, reads the
 * suppressed violations off the results, and exits non-zero on any that are not grandfathered.
 * Because it works from ESLint's suppressed-message data, no disable directive can reach it.
 *
 * A real bypass requires a file to contain both an `Onyx.connect` reference and an `eslint-disable`
 * directive, so we first narrow the targets to files matching both (via git grep) and only run
 * ESLint on those — keeping the check fast even on a whole-repo lint. The `Onyx.connect` match
 * deliberately omits the `(` so it stays a superset of the AST rule (e.g. whitespace or a comment
 * before the paren); extra matches like `Onyx.connectWithoutView` are harmless, as the rule ignores them.
 */
import tsParser from '@typescript-eslint/parser';
import {ESLint} from 'eslint';
import type {Rule} from 'eslint';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import path from 'node:path';
import {BANNED_RULE_ID, collectSuppressedBans, findNewBypasses} from './onyxConnectBypass';

const projectRoot = path.resolve(__dirname, '..');

/** The ban's rule name as registered under the `rulesdir` plugin (i.e. `BANNED_RULE_ID` without the prefix). */
const RULE_NAME = 'no-onyx-connect';

function isRuleModule(value: unknown): value is Rule.RuleModule {
    return typeof value === 'object' && value !== null && 'create' in value && typeof value.create === 'function';
}

/** Dynamically import the shipped `no-onyx-connect` rule, which is ESM with relative imports. */
async function loadNoOnyxConnectRule(): Promise<Rule.RuleModule> {
    const require = createRequire(__filename);
    const expensifyConfigDirectory = path.dirname(require.resolve('eslint-config-expensify/package.json'));
    const ruleFile = path.join(expensifyConfigDirectory, 'eslint-plugin-expensify', 'no-onyx-connect.js');
    const imported: unknown = await import(ruleFile);
    if (isRuleModule(imported)) {
        return imported;
    }
    if (typeof imported === 'object' && imported !== null && 'default' in imported && isRuleModule(imported.default)) {
        return imported.default;
    }
    throw new Error(`Could not load the no-onyx-connect rule from ${ruleFile}`);
}

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
        // git grep exits 1 when nothing matches; anything else is a real failure.
        if (typeof error === 'object' && error !== null && 'status' in error && error.status === 1) {
            return [];
        }
        throw error;
    }
}

async function run(): Promise<void> {
    const candidates = findCandidateFiles(process.argv.slice(2));
    if (candidates.length === 0) {
        return;
    }

    const rule = await loadNoOnyxConnectRule();
    const eslint = new ESLint({
        cwd: projectRoot,
        warnIgnored: false,
        errorOnUnmatchedPattern: false,
        overrideConfigFile: true,
        overrideConfig: [
            {
                files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
                languageOptions: {parser: tsParser},
                plugins: {rulesdir: {rules: {[RULE_NAME]: rule}}},
                rules: {[BANNED_RULE_ID]: 'error'},
            },
        ],
    });

    const results = await eslint.lintFiles(candidates);
    const newBypasses = findNewBypasses(collectSuppressedBans(results, projectRoot));
    if (newBypasses.length === 0) {
        return;
    }

    console.error('Onyx.connect() is banned and the ban cannot be bypassed with eslint-disable. Use the useOnyx() hook to read Onyx data instead.');
    console.error('New bypasses found:');
    for (const bypass of newBypasses) {
        console.error(`  ${bypass.file}:${bypass.line}`);
    }
    process.exitCode = 1;
}

run().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
