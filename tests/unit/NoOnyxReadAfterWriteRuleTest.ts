import type {Rule} from 'eslint';

import {RuleTester} from 'eslint';

type LocalRuleModule = Rule.RuleModule & {
    name: string;
};

function isLocalRuleModule(ruleModule: unknown): ruleModule is LocalRuleModule {
    if (typeof ruleModule !== 'object' || ruleModule === null) {
        return false;
    }

    const ruleName: unknown = Reflect.get(ruleModule, 'name');
    const create: unknown = Reflect.get(ruleModule, 'create');
    const meta: unknown = Reflect.get(ruleModule, 'meta');

    return typeof ruleName === 'string' && typeof create === 'function' && typeof meta === 'object' && meta !== null;
}

const ruleModule: unknown = require('../../eslint-plugin-local-rules/no-onyx-read-after-write');

if (!isLocalRuleModule(ruleModule)) {
    throw new TypeError('Expected no-onyx-read-after-write to export an ESLint rule module.');
}

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
});

const ONYX_IMPORT = "import Onyx from 'react-native-onyx';";
const BOTH_IMPORTS = `${ONYX_IMPORT} import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';`;
const ERRORS = [{messageId: 'noOnyxReadAfterWrite'}];

/**
 * Validation step B5a of ONYX-GET-VALIDATION-PLAN.md, which encodes the authoring rule A1 produced:
 * do all of the reads before the first write, or await the write before reading.
 *
 * A1 measured that `Onyx.merge` and `Onyx.update` apply to the cache in a later microtask, so a
 * synchronous read after either returns the pre-write value. `set` and `mergeCollection` are visible
 * immediately, and are still flagged, because code that relies on which is which breaks when the same
 * call moves inside `update()`, where even a SET is deferred.
 */
describe('no-onyx-read-after-write', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            // The sanctioned order: read first, then write.
            `${ONYX_IMPORT} function submit() { const draft = Onyx.get(key); Onyx.merge(key, {...draft, sent: true}); }`,
            `${ONYX_IMPORT} function submit() { const a = Onyx.get(keyA); const b = Onyx.get(keyB); Onyx.update([{onyxMethod: 'merge', key: keyA, value: b}]); }`,

            // Awaited, so the write has landed by the time the read runs.
            `${ONYX_IMPORT} async function submit() { await Onyx.merge(key, value); return Onyx.get(key); }`,
            `${ONYX_IMPORT} async function submit() { await Promise.all([Onyx.merge(keyA, value), Onyx.merge(keyB, value)]); return Onyx.get(keyA); }`,
            `${ONYX_IMPORT} const submit = async () => { await Onyx.update(operations); return Onyx.get(key); };`,

            // Different bodies, so nothing here says the read runs in the write's tick.
            `${ONYX_IMPORT} function write() { Onyx.merge(key, value); } function read() { return Onyx.get(key); }`,
            `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); setTimeout(() => Onyx.get(key), 0); }`,
            `${ONYX_IMPORT} function submit() { Onyx.merge(key, value).then(() => Onyx.get(key)); }`,

            // The read is an argument of the write, so it is evaluated before it.
            `${ONYX_IMPORT} function submit() { Onyx.merge(key, Onyx.get(key)); }`,

            // Provably different keys: A1's rule exempts reads of keys the tick did not write.
            `${ONYX_IMPORT} function submit() { Onyx.merge(ONYXKEYS.SESSION, value); return Onyx.get(ONYXKEYS.ACCOUNT); }`,
            `${ONYX_IMPORT} function submit(reportID) { Onyx.merge(\`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`, value); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT_ACTIONS}\${reportID}\`); }`,
            `${ONYX_IMPORT} function submit(reportID) { Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, values); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`); }`,

            // The guard-clause shape: reaching the write means leaving before the read.
            `${ONYX_IMPORT} function submit(report) { if (isMoneyRequestReport(report)) { Onyx.merge(key, null); return; } return Onyx.get(key); }`,
            `${ONYX_IMPORT} function submit(report) { if (!report) { Onyx.merge(key, null); throw new Error('no report'); } return Onyx.get(key); }`,

            // Only one of the two can run.
            `${ONYX_IMPORT} function submit() { if (shouldWrite) { Onyx.merge(key, value); } else { use(Onyx.get(key)); } }`,
            `${ONYX_IMPORT} function submit() { return shouldWrite ? Onyx.merge(key, value) : Onyx.get(key); }`,
            `${ONYX_IMPORT} function submit(action) { switch (action) { case 'write': Onyx.merge(key, value); break; case 'read': use(Onyx.get(key)); break; } }`,

            // Module scope is no-onyx-read-at-module-scope's brief, which already reports every read there.
            `${ONYX_IMPORT} Onyx.merge(key, value); const restored = Onyx.get(key);`,

            // Not the library: a local object that happens to expose both.
            'const Onyx = {merge: () => {}, get: () => undefined}; function submit() { Onyx.merge(key, value); return Onyx.get(key); }',

            // One half alone is not a hazard.
            `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); }`,
            `${ONYX_IMPORT} function submit() { return Onyx.get(key); }`,
        ],
        invalid: [
            // Every write API, since relying on which ones are visible synchronously is the fragile part.
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); return Onyx.get(key); }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.update(operations); return Onyx.get(key); }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.set(key, value); return Onyx.get(key); }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.mergeCollection(collectionKey, values); return Onyx.get(key); }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.multiSet(values); return Onyx.get(key); }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.setCollection(collectionKey, values); return Onyx.get(key); }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.clear(); return Onyx.get(key); }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx['merge'](key, value); return Onyx.get(key); }`, errors: ERRORS},

            // Every read API.
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); return Onyx.multiGet(keys); }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); return Onyx.tupleGet(keys); }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); return Onyx.getAllKeys(); }`, errors: ERRORS},
            {code: `${BOTH_IMPORTS} function submit() { Onyx.merge(key, value); return OnyxUtils.get(key); }`, errors: ERRORS},

            // Function boundaries that defer nothing, so the read is still in the write's tick.
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); return keys.map((each) => Onyx.get(each)); }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); return (() => Onyx.get(key))(); }`, errors: ERRORS},

            // Same key, and keys that cannot be compared: a collection key built at runtime, and bare identifiers.
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(ONYXKEYS.SESSION, value); return Onyx.get(ONYXKEYS.SESSION); }`, errors: ERRORS},
            {
                code: `${ONYX_IMPORT} function submit(reportID) { Onyx.merge(ONYXKEYS.COLLECTION.REPORT + reportID, value); return Onyx.get(ONYXKEYS.COLLECTION.REPORT + reportID); }`,
                errors: ERRORS,
            },
            {code: `${ONYX_IMPORT} function submit(writeKey, readKey) { Onyx.merge(writeKey, value); return Onyx.get(readKey); }`, errors: ERRORS},

            // Two members of one collection: nothing proves the two ids differ.
            {
                code: `${ONYX_IMPORT} function submit(reportID, otherID) { Onyx.merge(\`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`, value); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${otherID}\`); }`,
                errors: ERRORS,
            },

            // Paths from different objects, which `ONYXKEYS` does alias in three places, so this is not provable.
            {code: `${ONYX_IMPORT} function submit(reportID) { Onyx.merge(ONYXKEYS.SESSION, value); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`); }`, errors: ERRORS},

            // Guard clauses that do not leave the body: no return, and a break that only leaves the loop.
            {code: `${ONYX_IMPORT} function submit(report) { if (isMoneyRequestReport(report)) { Onyx.merge(key, null); } return Onyx.get(key); }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function submit(reports) { for (const report of reports) { if (report) { Onyx.merge(key, null); break; } } return Onyx.get(key); }`, errors: ERRORS},

            // An async function that forgot the await, and a promise that is created but not awaited.
            {code: `${ONYX_IMPORT} async function submit() { Onyx.merge(key, value); return Onyx.get(key); }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} async function submit() { Promise.all([Onyx.update(operations)]); return Onyx.get(key); }`, errors: ERRORS},

            // Aliased read, and aliased write.
            {code: `${ONYX_IMPORT} const {get} = Onyx; function submit() { Onyx.merge(key, value); return get(key); }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} const {merge} = Onyx; function submit() { merge(key, value); return Onyx.get(key); }`, errors: ERRORS},

            // Ordering inside one statement, and a write whose failure path still reaches the read.
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value), use(Onyx.get(key)); }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function submit() { try { Onyx.merge(key, value); } catch (error) { use(Onyx.get(key)); } }`, errors: ERRORS},

            // Two reads after one write report twice.
            {
                code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); return [Onyx.get(keyA), Onyx.get(keyB)]; }`,
                errors: [{messageId: 'noOnyxReadAfterWrite'}, {messageId: 'noOnyxReadAfterWrite'}],
            },
        ],
    });
});
