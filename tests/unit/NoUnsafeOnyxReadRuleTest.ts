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

const ruleModule: unknown = require('../../eslint-plugin-local-rules/no-unsafe-onyx-read');

if (!isLocalRuleModule(ruleModule)) {
    throw new TypeError('Expected no-unsafe-onyx-read to export an ESLint rule module.');
}

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parserOptions: {
            ecmaFeatures: {jsx: true},
        },
    },
});

const ONYX_IMPORT = "import Onyx from 'react-native-onyx';";
const ONYX_UTILS_IMPORT = "import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';";
const BOTH_IMPORTS = `${ONYX_IMPORT} ${ONYX_UTILS_IMPORT}`;

const RENDER_ERRORS = [{messageId: 'noOnyxGetInRender'}];
const MODULE_SCOPE_ERRORS = [{messageId: 'noOnyxReadAtModuleScope'}];
const READ_AFTER_WRITE_ERRORS = [{messageId: 'noOnyxReadAfterWrite'}];

/**
 * Validation steps B1a, B5a and B5b of ONYX-GET-VALIDATION-PLAN.md, which were three rules and three
 * suites until they were merged. The rule polices one call, `Onyx.get(...)`, on two axes:
 *
 * - position: not during render (the read does not subscribe), and not at module scope (it runs at
 *   import time, before `Onyx.init()` has hydrated the cache);
 * - order: not after an un-awaited write in the same body, because A1 measured that `Onyx.merge` and
 *   `Onyx.update` apply in a later microtask, so the read returns the pre-write value. `set` and
 *   `mergeCollection` are visible immediately, and are still flagged, because code that relies on which
 *   is which breaks when the same call moves inside `update()`, where even a SET is deferred.
 *
 * One read gets one message. Position decides first, so a read that is both in render and after a write
 * reports as the render read, which is the fix that subsumes the other.
 */
describe('no-unsafe-onyx-read', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            // The sanctioned position: inside a function, so it runs when something calls it.
            `${ONYX_IMPORT} function buildPayload(reportID) { return Onyx.get(reportID); }`,
            `${ONYX_IMPORT} export function submit() { const draft = Onyx.get(key); return draft; }`,
            `${ONYX_UTILS_IMPORT} export function submit() { const draft = OnyxUtils.get(key); return draft; }`,
            `${ONYX_UTILS_IMPORT} const submit = () => OnyxUtils.get(key);`,
            `${ONYX_IMPORT} export default function handler() { return Onyx.get(key); }`,
            `${ONYX_IMPORT} const handlers = {onPress: () => Onyx.get(key)};`,
            `${ONYX_IMPORT} class Store { read() { return Onyx.get(key); } }`,

            // Event handlers, however they are written.
            `${ONYX_IMPORT} function Row() { const onPress = () => Onyx.get(key); return <View onPress={onPress} />; }`,
            `${ONYX_IMPORT} function Row() { return <View onPress={() => Onyx.get(key)} />; }`,
            `${ONYX_IMPORT} function Row() { function onPress() { return Onyx.get(key); } return <View onPress={onPress} />; }`,
            `${ONYX_IMPORT} function Row() { const onPress = async () => { await save(); return Onyx.get(key); }; return <View onPress={onPress} />; }`,

            // Hook callbacks that do not run during render.
            `${ONYX_IMPORT} function Row() { const onPress = useCallback(() => Onyx.get(key), []); return <View onPress={onPress} />; }`,
            `${ONYX_IMPORT} function Row() { useEffect(() => { Onyx.get(key); }, []); return <View />; }`,
            `${ONYX_IMPORT} function Row() { useLayoutEffect(() => { Onyx.get(key); }, []); return <View />; }`,
            `${ONYX_UTILS_IMPORT} function useThing() { return () => OnyxUtils.get(key); }`,

            // Deferred at module scope is still deferred: the callback runs on the timer or the promise, not now.
            `${ONYX_IMPORT} setTimeout(() => Onyx.get(key), 0);`,
            `${ONYX_IMPORT} ready.then(() => Onyx.get(key));`,
            `${ONYX_IMPORT} Onyx.init(config).then(() => Onyx.get(key));`,

            // Not the library: a local object that happens to expose a get, and the debug shim on window.
            'const Onyx = {get: () => undefined}; const initialValue = Onyx.get(key);',
            'const Onyx = {get: () => undefined}; function Row() { const value = Onyx.get(key); return <View value={value} />; }',
            'const initialValue = window.Onyx.get(key);',
            'function Row() { return <View onLoad={window.Onyx.get(key)} />; }',

            // A write on its own is not this rule's business, wherever it sits.
            `${ONYX_IMPORT} Onyx.merge(key, value);`,
            `${ONYX_IMPORT} Onyx.init({keys: ONYXKEYS});`,
            `${ONYX_IMPORT} function Row() { Onyx.merge(key, value); return <View />; }`,
            `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); }`,
            `${ONYX_IMPORT} function submit() { return Onyx.get(key); }`,

            // An aliased read is still deferred when it sits in a handler.
            `${ONYX_UTILS_IMPORT} const {get} = OnyxUtils; function Row() { const onPress = () => get(key); return <View onPress={onPress} />; }`,

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

            // Not the library: a local object that happens to expose both.
            'const Onyx = {merge: () => {}, get: () => undefined}; function submit() { Onyx.merge(key, value); return Onyx.get(key); }',
        ],
        invalid: [
            // ---------------------------------------------------------------------------------------
            // Render position
            // ---------------------------------------------------------------------------------------

            // The plain case, in a component and in a hook.
            {code: `${ONYX_IMPORT} function Row() { const value = Onyx.get(key); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = () => { const value = Onyx.get(key); return <View value={value} />; };`, errors: RENDER_ERRORS},
            {code: `${ONYX_UTILS_IMPORT} function useThing() { return OnyxUtils.get(key); }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const useReportName = () => Onyx.get(key);`, errors: RENDER_ERRORS},

            // Anonymous and wrapped components, which have no name to go by.
            {code: `${ONYX_IMPORT} export default function() { const value = Onyx.get(key); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = memo(() => { const value = Onyx.get(key); return <View value={value} />; });`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = memo(function () { const value = Onyx.get(key); return <View value={value} />; });`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = forwardRef((props, ref) => { const value = Onyx.get(key); return <View ref={ref} value={value} />; });`, errors: RENDER_ERRORS},

            // Inside JSX, which is evaluated as the element is built.
            {code: `${ONYX_IMPORT} function Row() { return <Text>{Onyx.get(key)}</Text>; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { return <View style={Onyx.get(key)} />; }`, errors: RENDER_ERRORS},

            // useMemo runs during render, unlike useCallback.
            {code: `${ONYX_IMPORT} function Row() { const value = useMemo(() => Onyx.get(key), []); return <View value={value} />; }`, errors: RENDER_ERRORS},

            // Function boundaries that defer nothing: an IIFE, and a synchronous array callback.
            {code: `${ONYX_IMPORT} function Row() { const value = (() => Onyx.get(key))(); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const values = ids.map((id) => Onyx.get(id)); return <View values={values} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const values = ids.filter((id) => Onyx.get(id)).map((id) => id); return <View values={values} />; }`, errors: RENDER_ERRORS},

            // Every synchronous read API, and both member access forms.
            {code: `${ONYX_IMPORT} function Row() { const value = Onyx['get'](key); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const values = Onyx.multiGet(keys); return <View values={values} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const values = Onyx.tupleGet(keys); return <View values={values} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const allKeys = Onyx.getAllKeys(); return <View allKeys={allKeys} />; }`, errors: RENDER_ERRORS},

            // Aliased reads, destructured and assigned.
            {code: `${ONYX_UTILS_IMPORT} const {get} = OnyxUtils; function Row() { const value = get(key); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const {get: readOnyx} = OnyxUtils; function Row() { const value = readOnyx(key); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const readOnyx = OnyxUtils.get; function Row() { const value = readOnyx(key); return <View value={value} />; }`, errors: RENDER_ERRORS},

            // Two reads in one render body report twice.
            {
                code: `${ONYX_IMPORT} function Row() { const a = Onyx.get(keyA); const b = Onyx.get(keyB); return <View a={a} b={b} />; }`,
                errors: [{messageId: 'noOnyxGetInRender'}, {messageId: 'noOnyxGetInRender'}],
            },

            // A JSX expression is a render position whatever the enclosing boundary is called. Here the
            // boundary alone says otherwise: the name is lowercase and the return argument is an identifier.
            {code: `${ONYX_IMPORT} function row() { const el = <View a={Onyx.get(key)} />; return el; }`, errors: RENDER_ERRORS},

            // ---------------------------------------------------------------------------------------
            // Module scope
            // ---------------------------------------------------------------------------------------

            // The plain case: a value captured at import time.
            {code: `${ONYX_IMPORT} const initialValue = Onyx.get(key);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const initialValue = OnyxUtils.get(key);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} export const session = Onyx.get(ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} let cached; cached = Onyx.get(key);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} if (shouldPreload) { const value = Onyx.get(key); use(value); }`, errors: MODULE_SCOPE_ERRORS},

            // Function boundaries that defer nothing, so the read still happens at import time.
            {code: `${ONYX_IMPORT} const initialValue = (() => Onyx.get(key))();`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} const values = keys.map((key) => Onyx.get(key));`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} const present = keys.filter((key) => Onyx.get(key)).map((key) => key);`, errors: MODULE_SCOPE_ERRORS},

            // Every synchronous read API, and both member access forms.
            {code: `${ONYX_IMPORT} const initialValue = Onyx['get'](key);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} const values = Onyx.multiGet(keys);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} const values = Onyx.tupleGet(keys);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} const allKeys = Onyx.getAllKeys();`, errors: MODULE_SCOPE_ERRORS},

            // Aliased reads, destructured and assigned.
            {code: `${ONYX_UTILS_IMPORT} const {get} = OnyxUtils; const initialValue = get(key);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const {get: readOnyx} = OnyxUtils; const initialValue = readOnyx(key);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const readOnyx = OnyxUtils.get; const initialValue = readOnyx(key);`, errors: MODULE_SCOPE_ERRORS},

            // Two reads at module scope report twice.
            {
                code: `${ONYX_IMPORT} const a = Onyx.get(keyA); const b = Onyx.get(keyB);`,
                errors: [{messageId: 'noOnyxReadAtModuleScope'}, {messageId: 'noOnyxReadAtModuleScope'}],
            },

            // A read written straight into JSX at module scope is the module-scope read, not the render one:
            // the element is built at import time. Three separate rules reported this twice.
            {code: `${ONYX_IMPORT} const el = <View a={Onyx.get(key)} />;`, errors: MODULE_SCOPE_ERRORS},

            // Module scope outranks the order check too: the read never had a live cache to be stale against.
            {code: `${ONYX_IMPORT} Onyx.merge(key, value); const restored = Onyx.get(key);`, errors: MODULE_SCOPE_ERRORS},

            // ---------------------------------------------------------------------------------------
            // Read after an un-awaited write
            // ---------------------------------------------------------------------------------------

            // Every write API, since relying on which ones are visible synchronously is the fragile part.
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.update(operations); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.set(key, value); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.mergeCollection(collectionKey, values); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.multiSet(values); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.setCollection(collectionKey, values); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.clear(); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx['merge'](key, value); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},

            // Every read API.
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); return Onyx.multiGet(keys); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); return Onyx.tupleGet(keys); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); return Onyx.getAllKeys(); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${BOTH_IMPORTS} function submit() { Onyx.merge(key, value); return OnyxUtils.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},

            // Function boundaries that defer nothing, so the read is still in the write's tick.
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); return keys.map((each) => Onyx.get(each)); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); return (() => Onyx.get(key))(); }`, errors: READ_AFTER_WRITE_ERRORS},

            // Same key, and keys that cannot be compared: a collection key built at runtime, and bare identifiers.
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(ONYXKEYS.SESSION, value); return Onyx.get(ONYXKEYS.SESSION); }`, errors: READ_AFTER_WRITE_ERRORS},
            {
                code: `${ONYX_IMPORT} function submit(reportID) { Onyx.merge(ONYXKEYS.COLLECTION.REPORT + reportID, value); return Onyx.get(ONYXKEYS.COLLECTION.REPORT + reportID); }`,
                errors: READ_AFTER_WRITE_ERRORS,
            },
            {code: `${ONYX_IMPORT} function submit(writeKey, readKey) { Onyx.merge(writeKey, value); return Onyx.get(readKey); }`, errors: READ_AFTER_WRITE_ERRORS},

            // Two members of one collection: nothing proves the two ids differ.
            {
                code: `${ONYX_IMPORT} function submit(reportID, otherID) { Onyx.merge(\`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`, value); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${otherID}\`); }`,
                errors: READ_AFTER_WRITE_ERRORS,
            },

            // Paths from different objects, which `ONYXKEYS` does alias in three places, so this is not provable.
            {
                code: `${ONYX_IMPORT} function submit(reportID) { Onyx.merge(ONYXKEYS.SESSION, value); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`); }`,
                errors: READ_AFTER_WRITE_ERRORS,
            },

            // Guard clauses that do not leave the body: no return, and a break that only leaves the loop.
            {code: `${ONYX_IMPORT} function submit(report) { if (isMoneyRequestReport(report)) { Onyx.merge(key, null); } return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {
                code: `${ONYX_IMPORT} function submit(reports) { for (const report of reports) { if (report) { Onyx.merge(key, null); break; } } return Onyx.get(key); }`,
                errors: READ_AFTER_WRITE_ERRORS,
            },

            // An async function that forgot the await, and a promise that is created but not awaited.
            {code: `${ONYX_IMPORT} async function submit() { Onyx.merge(key, value); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} async function submit() { Promise.all([Onyx.update(operations)]); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},

            // Aliased read, and aliased write.
            {code: `${ONYX_IMPORT} const {get} = Onyx; function submit() { Onyx.merge(key, value); return get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} const {merge} = Onyx; function submit() { merge(key, value); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},

            // Ordering inside one statement, and a write whose failure path still reaches the read.
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value), use(Onyx.get(key)); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { try { Onyx.merge(key, value); } catch (error) { use(Onyx.get(key)); } }`, errors: READ_AFTER_WRITE_ERRORS},

            // Two reads after one write report twice.
            {
                code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); return [Onyx.get(keyA), Onyx.get(keyB)]; }`,
                errors: [{messageId: 'noOnyxReadAfterWrite'}, {messageId: 'noOnyxReadAfterWrite'}],
            },

            // The order check still applies inside a component, as long as the read itself is at event time.
            {
                code: `${ONYX_IMPORT} function Row() { const onPress = () => { Onyx.merge(key, value); return Onyx.get(key); }; return <View onPress={onPress} />; }`,
                errors: READ_AFTER_WRITE_ERRORS,
            },

            // Position outranks order: this is both a render read and a read after a write, and it reports once.
            {code: `${ONYX_IMPORT} function Row() { Onyx.merge(key, value); const a = Onyx.get(key); return <View a={a} />; }`, errors: RENDER_ERRORS},
        ],
    });
});
