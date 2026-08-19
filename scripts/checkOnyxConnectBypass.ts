#!/usr/bin/env bun

import type {Rule} from 'eslint';

/**
 * Fails the lint run when a new inline `eslint-disable` bypasses one of the Onyx lint bans.
 *
 * The bans are normal lint rules (`rulesdir/no-onyx-connect`, shipped by eslint-config-expensify, plus
 * `no-unsafe-onyx-read` in this repo's `eslint-plugin-local-rules/`), so an inline disable can silence
 * either of them. The ESLint CLI neither surfaces nor fails on such suppressed violations, so this runner
 * re-elevates them: it lints with only those rules enabled, reads the suppressed violations off the
 * results, and exits non-zero on any that are not grandfathered.
 * Because it works from ESLint's suppressed-message data, no disable directive can reach it.
 *
 * A real bypass requires a file to contain both an `eslint-disable` directive and the text the rule
 * needs in order to fire, so we first narrow the targets to files matching both (via git grep) and
 * only run ESLint on those — keeping the check fast even on a whole-repo lint. Each rule's grep terms
 * are deliberately a superset of its AST rule: `Onyx.connect` omits the `(` so whitespace or a
 * comment before the paren still matches, and the read rule greps for the library import, which every
 * read it can flag has to go through. Extra matches are harmless, since the rules ignore what does not
 * concern them.
 */
import {ESLint} from 'eslint';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import path from 'node:path';
import {parser as tsParser} from 'typescript-eslint';

import {BANNED_RULE_ID, UNSAFE_READ_RULE_ID, collectSuppressedBans, findNewBypasses} from './onyxConnectBypass';

const projectRoot = path.resolve(__dirname, '..');

/** A ban this runner re-elevates. */
type PolicedRule = {
    /** Rule id including the `rulesdir/` prefix, as it appears in ESLint messages. */
    id: string;

    /** Rule name registered under the `rulesdir` plugin (the id without the prefix). */
    name: string;

    /** Loads the rule module. */
    load: () => Promise<Rule.RuleModule>;

    /** Terms a file must all contain for the rule to be able to fire in it. Must stay a superset of the rule. */
    grepTerms: string[];

    /** What to tell a developer who tried to disable the rule inline. */
    advice: string;
};

function isRuleModule(value: unknown): value is Rule.RuleModule {
    return typeof value === 'object' && value !== null && 'create' in value && typeof value.create === 'function';
}

/** Import a rule module from a file path, tolerating both a namespace export and a default export. */
async function importRule(ruleFile: string): Promise<Rule.RuleModule> {
    const imported: unknown = await import(ruleFile);
    if (isRuleModule(imported)) {
        return imported;
    }
    if (typeof imported === 'object' && imported !== null && 'default' in imported && isRuleModule(imported.default)) {
        return imported.default;
    }
    throw new Error(`Could not load an ESLint rule from ${ruleFile}`);
}

/** Load a rule shipped by eslint-config-expensify, which is ESM with relative imports. */
function loadShippedRule(ruleName: string): () => Promise<Rule.RuleModule> {
    return () => {
        const require = createRequire(__filename);
        // Resolve the package entry rather than its package.json, since eslint-config-expensify's `exports` map doesn't expose ./package.json.
        const expensifyConfigDirectory = path.dirname(require.resolve('eslint-config-expensify'));
        return importRule(path.join(expensifyConfigDirectory, 'eslint-plugin-expensify', `${ruleName}.js`));
    };
}

/** Load a rule from this repo's own rules directory, which is already on `rulesdir.RULES_DIR`. */
function loadLocalRule(ruleName: string): () => Promise<Rule.RuleModule> {
    return () => importRule(path.join(projectRoot, 'eslint-plugin-local-rules', `${ruleName}.js`));
}

const POLICED_RULES: PolicedRule[] = [
    {
        id: BANNED_RULE_ID,
        name: 'no-onyx-connect',
        load: loadShippedRule('no-onyx-connect'),
        grepTerms: ['Onyx.connect', 'eslint-disable'],
        advice: 'Onyx.connect() is banned and the ban cannot be bypassed with eslint-disable. Use the useOnyx() hook to read Onyx data instead.',
    },
    {
        id: UNSAFE_READ_RULE_ID,
        name: 'no-unsafe-onyx-read',
        load: loadLocalRule('no-unsafe-onyx-read'),
        grepTerms: ['react-native-onyx', 'eslint-disable'],
        advice: 'Unsafe synchronous Onyx reads are banned and the ban cannot be bypassed with eslint-disable. One disable silences all three positions, so check which one applies. During render: use useOnyx() for anything the component renders, and keep the synchronous read in code that runs on an event. At module scope: a module body runs at import time, before Onyx.init() has hydrated the cache, so the read returns undefined for anything held only on disk; move it into the function that needs it. After an un-awaited write: Onyx.merge() and Onyx.update() apply in a later microtask, so the read returns the pre-write value; do all of the reads before the first write, or await the write.',
    },
];

/** Files among the lint targets that contain every one of the given terms. */
function findCandidateFiles(targets: string[], terms: string[]): string[] {
    const pathSpecs = targets.length > 0 ? targets : ['.'];
    const termArgs = terms.flatMap((term) => ['-e', term]);
    try {
        const output = execFileSync('git', ['grep', '-lI', '-F', '--all-match', '--untracked', '--no-recurse-submodules', ...termArgs, '--', ...pathSpecs], {
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

/**
 * Checks `targets` for new bypasses of the Onyx lint bans, reporting any to stderr.
 * Returns `true` if a new bypass was found (i.e. the caller should fail).
 */
async function checkOnyxConnectBypass(targets: string[]): Promise<boolean> {
    // A rule with no candidate files cannot fire anywhere, since its grep terms are a superset of the rule.
    const applicableRules = POLICED_RULES.map((rule) => ({rule, candidates: findCandidateFiles(targets, rule.grepTerms)})).filter(({candidates}) => candidates.length > 0);
    if (applicableRules.length === 0) {
        return false;
    }

    const candidates = [...new Set(applicableRules.flatMap(({candidates: files}) => files))];
    const loadedRules = await Promise.all(applicableRules.map(async ({rule}) => ({rule, module: await rule.load()})));

    const eslint = new ESLint({
        cwd: projectRoot,
        warnIgnored: false,
        errorOnUnmatchedPattern: false,
        overrideConfigFile: true,
        overrideConfig: [
            {
                files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
                languageOptions: {parser: tsParser},
                plugins: {rulesdir: {rules: Object.fromEntries(loadedRules.map(({rule, module}) => [rule.name, module]))}},
                rules: Object.fromEntries(loadedRules.map(({rule}) => [rule.id, 'error' as const])),
            },
        ],
    });

    const results = await eslint.lintFiles(candidates);
    const newBypasses = findNewBypasses(collectSuppressedBans(results, projectRoot));
    if (newBypasses.length === 0) {
        return false;
    }

    for (const {rule} of applicableRules) {
        const bypassesForRule = newBypasses.filter((bypass) => bypass.ruleId === rule.id);
        if (bypassesForRule.length === 0) {
            continue;
        }
        console.error(rule.advice);
        console.error('New bypasses found:');
        for (const bypass of bypassesForRule) {
            console.error(`  ${bypass.file}:${bypass.line}`);
        }
    }
    return true;
}

if (require.main === module) {
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
