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
const WRAPPER_IMPORT = "import OnyxUtils from '@libs/OnyxUtils';";

const RENDER_ERRORS = [{messageId: 'noOnyxGetInRender'}];
const MODULE_SCOPE_ERRORS = [{messageId: 'noOnyxReadAtModuleScope'}];
const READ_AFTER_WRITE_ERRORS = [{messageId: 'noOnyxReadAfterWrite'}];
const DIRECT_ERRORS = [{messageId: 'noDirectOnyxGet'}];
const MUTATION_ERRORS = [{messageId: 'noMutatedOnyxRead'}];

const OPTIONS = [{readSurface: '@libs/OnyxUtils'}];

/**
 * The rule polices one call, `Onyx.get(...)`, on two axes:
 *
 * - position: not during render, where the read does not subscribe, and not at module scope, where
 *   nothing can await it and the value can only go stale in a module variable;
 * - order: not after an un-awaited write in the same body. Only `set` and `multiSet` write the cache
 *   before returning; `merge`, `update`, `clear`, `mergeCollection` and `setCollection` all land later,
 *   and awaiting the read does not wait for them. The two that do land are still flagged, because code
 *   relying on which is which breaks when the call moves inside `update()`, where even a SET is deferred.
 *
 * Hydration is not an axis: the public `Onyx.get` resolves only after `Onyx.init`, so a read cannot beat
 * the cache into existence.
 *
 * One read gets one message, position first.
 */
describe('no-unsafe-onyx-read', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            `${WRAPPER_IMPORT} function buildPayload(reportID) { return OnyxUtils.get(reportID); }`,
            {code: `${WRAPPER_IMPORT} export async function submit() { return OnyxUtils.get(ONYXKEYS.SESSION); }`, options: OPTIONS},
            {code: `${WRAPPER_IMPORT} export async function submit() { return OnyxUtils.get(ONYXKEYS.COLLECTION.REPORT_DRAFT); }`, options: OPTIONS},
            `${WRAPPER_IMPORT} export function submit() { const draft = OnyxUtils.get(key); return draft; }`,
            `${ONYX_IMPORT} export function submit() { const draft = Onyx.get(key); return draft; }`,
            `${ONYX_UTILS_IMPORT} export function submit() { const draft = OnyxUtils.get(key); return draft; }`,
            `${ONYX_UTILS_IMPORT} const submit = () => OnyxUtils.get(key);`,
            `${ONYX_IMPORT} export default function handler() { return Onyx.get(key); }`,
            `${ONYX_IMPORT} const handlers = {onPress: () => Onyx.get(key)};`,
            `${ONYX_IMPORT} class Store { read() { return Onyx.get(key); } }`,

            `${ONYX_IMPORT} function Row() { const onPress = () => Onyx.get(key); return <View onPress={onPress} />; }`,
            `${ONYX_IMPORT} function Row() { return <View onPress={() => Onyx.get(key)} />; }`,
            `${ONYX_IMPORT} function Row() { function onPress() { return Onyx.get(key); } return <View onPress={onPress} />; }`,
            `${ONYX_IMPORT} function Row() { const onPress = async () => { await save(); return Onyx.get(key); }; return <View onPress={onPress} />; }`,

            `${ONYX_IMPORT} function Row() { const onPress = useCallback(() => Onyx.get(key), []); return <View onPress={onPress} />; }`,
            `${ONYX_IMPORT} function Row() { useEffect(() => { use(Onyx.get(key)); }, []); return <View />; }`,
            `${ONYX_IMPORT} function Row() { useLayoutEffect(() => { use(Onyx.get(key)); }, []); return <View />; }`,
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

            `${ONYX_IMPORT} Onyx.merge(key, value);`,
            `${ONYX_IMPORT} Onyx.init({keys: ONYXKEYS});`,
            `${ONYX_IMPORT} function Row() { Onyx.merge(key, value); return <View />; }`,
            `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); }`,
            `${ONYX_IMPORT} function submit() { return Onyx.get(key); }`,

            // Copies are the fix, so they must not be flagged.
            `${WRAPPER_IMPORT} async function f(key) { const report = await OnyxUtils.get(key); const copy = {...report}; copy.name = 'x'; return copy; }`,
            `${WRAPPER_IMPORT} async function f(key) { const report = {...(await OnyxUtils.get(key))}; report.name = 'x'; return report; }`,
            `${WRAPPER_IMPORT} async function f(key) { const report = await OnyxUtils.get(key); return {...report, name: 'x'}; }`,
            `${WRAPPER_IMPORT} async function f(key) { const report = await OnyxUtils.get(key); return report.name; }`,
            `${WRAPPER_IMPORT} async function f(key) { const report = await OnyxUtils.get(key); if (report.name) { return 1; } return 2; }`,

            // An aliased read is still deferred when it sits in a handler.
            `${ONYX_UTILS_IMPORT} const {get} = OnyxUtils; function Row() { const onPress = () => get(key); return <View onPress={onPress} />; }`,

            `${ONYX_IMPORT} function submit() { const draft = Onyx.get(key); Onyx.merge(key, {...draft, sent: true}); }`,
            `${ONYX_IMPORT} function submit() { const a = Onyx.get(keyA); const b = Onyx.get(keyB); Onyx.update([{onyxMethod: 'merge', key: keyA, value: b}]); }`,

            `${ONYX_IMPORT} async function submit() { await Onyx.merge(key, value); return Onyx.get(key); }`,
            `${ONYX_IMPORT} async function submit() { await Promise.all([Onyx.merge(keyA, value), Onyx.merge(keyB, value)]); return Onyx.get(keyA); }`,
            `${ONYX_IMPORT} const submit = async () => { await Onyx.update(operations); return Onyx.get(key); };`,

            // Suspended between the write and the read, so the read no longer runs in the write's tick. The
            // await does not have to be on the write itself: awaiting a handle taken earlier, or a flush
            // helper such as `waitForBatchedUpdates`, ends the tick just the same.
            `${ONYX_IMPORT} async function submit() { const pending = Onyx.merge(key, value); await pending; return Onyx.get(key); }`,
            `${ONYX_IMPORT} async function submit() { Onyx.merge(key, value); await waitForBatchedUpdates(); return Onyx.get(key); }`,
            `${ONYX_IMPORT} async function submit() { Onyx.update(operations); await waitForBatchedUpdates(); return Onyx.get(key); }`,
            `${ONYX_IMPORT} async function submit() { const promises = [Onyx.merge(keyA, value), Onyx.merge(keyB, value)]; await Promise.all(promises); return Onyx.get(keyA); }`,

            // The write's own await finishes before the read starts, even when the read is inside a second one.
            `${ONYX_IMPORT} async function submit() { await Promise.all([Onyx.merge(keyA, value), Onyx.merge(keyB, value)]); return await Promise.all([Onyx.get(keyA), Onyx.get(keyB)]); }`,

            `${ONYX_IMPORT} function write() { Onyx.merge(key, value); } function read() { return Onyx.get(key); }`,
            `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); setTimeout(() => Onyx.get(key), 0); }`,
            `${ONYX_IMPORT} function submit() { Onyx.merge(key, value).then(() => Onyx.get(key)); }`,

            // The read is an argument of the write, so it is evaluated before it.
            `${ONYX_IMPORT} function submit() { Onyx.merge(key, Onyx.get(key)); }`,

            // Provably different keys: a read of a key the tick did not write is always current.
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
            {code: `${WRAPPER_IMPORT} async function f(key) { const report = await OnyxUtils.get(key); report.name = 'x'; return report; }`, errors: MUTATION_ERRORS},
            {code: `${WRAPPER_IMPORT} async function f(key) { const report = await OnyxUtils.get(key); report.name ??= 'x'; return report; }`, errors: MUTATION_ERRORS},
            {code: `${WRAPPER_IMPORT} async function f(key) { const report = await OnyxUtils.get(key); delete report.name; return report; }`, errors: MUTATION_ERRORS},
            {code: `${WRAPPER_IMPORT} async function f(key) { const report = await OnyxUtils.get(key); report.count++; return report; }`, errors: MUTATION_ERRORS},
            {code: `${WRAPPER_IMPORT} async function f(key) { const report = await OnyxUtils.get(key); Object.assign(report, {name: 'x'}); return report; }`, errors: MUTATION_ERRORS},
            {code: `${WRAPPER_IMPORT} async function f(key) { const report = await OnyxUtils.get(key); report.items.push(1); return report; }`, errors: MUTATION_ERRORS},

            {code: `${WRAPPER_IMPORT} async function f(key) { const actions = (await OnyxUtils.get(key))?.actions; actions.latest = 1; return actions; }`, errors: MUTATION_ERRORS},

            {code: `${WRAPPER_IMPORT} function Row() { const value = OnyxUtils.get(key); return <View value={value} />; }`, errors: RENDER_ERRORS},

            // Reading straight off the library skips the wrapper, and with it the Search snapshot guard.
            {code: `${ONYX_IMPORT} export async function submit() { return Onyx.get(key); }`, options: OPTIONS, errors: DIRECT_ERRORS},
            {code: `${ONYX_IMPORT} const {get} = Onyx; export async function submit() { return get(key); }`, options: OPTIONS, errors: DIRECT_ERRORS},

            {code: `${WRAPPER_IMPORT} const initialValue = OnyxUtils.get(key);`, errors: MODULE_SCOPE_ERRORS},
            {
                code: `${ONYX_IMPORT} ${WRAPPER_IMPORT} async function submit() { Onyx.merge(key, value); return OnyxUtils.get(key); }`,
                errors: READ_AFTER_WRITE_ERRORS,
            },

            // The two shapes that reach a read from render now that a component cannot await one.
            {code: `${ONYX_IMPORT} function Row() { const value = use(Onyx.get(key)); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { Onyx.get(key).then(setValue); return <View />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function useReportName() { return use(Onyx.get(key)); }`, errors: RENDER_ERRORS},

            {code: `${ONYX_IMPORT} function Row() { const value = Onyx.get(key); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = () => { const value = Onyx.get(key); return <View value={value} />; };`, errors: RENDER_ERRORS},
            {code: `${ONYX_UTILS_IMPORT} function useThing() { return OnyxUtils.get(key); }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const useReportName = () => Onyx.get(key);`, errors: RENDER_ERRORS},

            // Anonymous and wrapped components, which have no name to go by.
            {code: `${ONYX_IMPORT} export default function() { const value = Onyx.get(key); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = memo(() => { const value = Onyx.get(key); return <View value={value} />; });`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = memo(function () { const value = Onyx.get(key); return <View value={value} />; });`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = forwardRef((props, ref) => { const value = Onyx.get(key); return <View ref={ref} value={value} />; });`, errors: RENDER_ERRORS},

            {code: `${ONYX_IMPORT} function Row() { return <Text>{Onyx.get(key)}</Text>; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { return <View style={Onyx.get(key)} />; }`, errors: RENDER_ERRORS},

            // useMemo runs during render, unlike useCallback.
            {code: `${ONYX_IMPORT} function Row() { const value = useMemo(() => Onyx.get(key), []); return <View value={value} />; }`, errors: RENDER_ERRORS},

            // Function boundaries that defer nothing: an IIFE, and a synchronous array callback.
            {code: `${ONYX_IMPORT} function Row() { const value = (() => Onyx.get(key))(); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const values = ids.map((id) => Onyx.get(id)); return <View values={values} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const values = ids.filter((id) => Onyx.get(id)).map((id) => id); return <View values={values} />; }`, errors: RENDER_ERRORS},

            {code: `${ONYX_IMPORT} function Row() { const value = Onyx['get'](key); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const values = Onyx.multiGet(keys); return <View values={values} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const values = Onyx.tupleGet(keys); return <View values={values} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const allKeys = Onyx.getAllKeys(); return <View allKeys={allKeys} />; }`, errors: RENDER_ERRORS},

            {code: `${ONYX_UTILS_IMPORT} const {get} = OnyxUtils; function Row() { const value = get(key); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const {get: readOnyx} = OnyxUtils; function Row() { const value = readOnyx(key); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const readOnyx = OnyxUtils.get; function Row() { const value = readOnyx(key); return <View value={value} />; }`, errors: RENDER_ERRORS},

            {
                code: `${ONYX_IMPORT} function Row() { const a = Onyx.get(keyA); const b = Onyx.get(keyB); return <View a={a} b={b} />; }`,
                errors: [{messageId: 'noOnyxGetInRender'}, {messageId: 'noOnyxGetInRender'}],
            },

            // A JSX expression is a render position whatever the enclosing boundary is called. Here the
            // boundary alone says otherwise: the name is lowercase and the return argument is an identifier.
            {code: `${ONYX_IMPORT} function row() { const el = <View a={Onyx.get(key)} />; return el; }`, errors: RENDER_ERRORS},

            {code: `${ONYX_IMPORT} const initialValue = Onyx.get(key);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const initialValue = OnyxUtils.get(key);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} export const session = Onyx.get(ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} let cached; cached = Onyx.get(key);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} if (shouldPreload) { const value = Onyx.get(key); use(value); }`, errors: MODULE_SCOPE_ERRORS},

            // Function boundaries that defer nothing, so the read still happens at import time.
            {code: `${ONYX_IMPORT} const initialValue = (() => Onyx.get(key))();`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} const values = keys.map((key) => Onyx.get(key));`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} const present = keys.filter((key) => Onyx.get(key)).map((key) => key);`, errors: MODULE_SCOPE_ERRORS},

            {code: `${ONYX_IMPORT} const initialValue = Onyx['get'](key);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} const values = Onyx.multiGet(keys);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} const values = Onyx.tupleGet(keys);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} const allKeys = Onyx.getAllKeys();`, errors: MODULE_SCOPE_ERRORS},

            {code: `${ONYX_UTILS_IMPORT} const {get} = OnyxUtils; const initialValue = get(key);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const {get: readOnyx} = OnyxUtils; const initialValue = readOnyx(key);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const readOnyx = OnyxUtils.get; const initialValue = readOnyx(key);`, errors: MODULE_SCOPE_ERRORS},

            {
                code: `${ONYX_IMPORT} const a = Onyx.get(keyA); const b = Onyx.get(keyB);`,
                errors: [{messageId: 'noOnyxReadAtModuleScope'}, {messageId: 'noOnyxReadAtModuleScope'}],
            },

            // A read written straight into JSX at module scope is the module-scope read, not the render one:
            // the element is built at import time. Three separate rules reported this twice.
            {code: `${ONYX_IMPORT} const el = <View a={Onyx.get(key)} />;`, errors: MODULE_SCOPE_ERRORS},

            // Module scope outranks the order check too: the read never had a live cache to be stale against.
            {code: `${ONYX_IMPORT} Onyx.merge(key, value); const restored = Onyx.get(key);`, errors: MODULE_SCOPE_ERRORS},

            // Every write API, since relying on which ones are visible synchronously is the fragile part.
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.update(operations); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.set(key, value); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.mergeCollection(collectionKey, values); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.multiSet(values); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.setCollection(collectionKey, values); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx.clear(); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { Onyx['merge'](key, value); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},

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

            // The read shares the write's await rather than following it, so the await defers nothing between
            // them: the read is called in the write's tick and only its delivery waits.
            {code: `${ONYX_IMPORT} async function submit() { return await Promise.all([Onyx.merge(key, value), Onyx.get(key)]); }`, errors: READ_AFTER_WRITE_ERRORS},
            {
                code: `${ONYX_IMPORT} async function submit() { const [, draft] = await Promise.all([Onyx.merge(keyA, value), Onyx.get(keyA)]); return draft; }`,
                errors: READ_AFTER_WRITE_ERRORS,
            },

            // An await that does not separate the two: it comes after the read, so the read still runs in the
            // write's tick, and one inside the read's own arguments is evaluated before the read itself.
            {code: `${ONYX_IMPORT} async function submit() { Onyx.merge(key, value); const draft = Onyx.get(key); await flush(); return draft; }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} async function submit() { Onyx.merge(key, value); return Onyx.get(await resolveKey()); }`, errors: READ_AFTER_WRITE_ERRORS},

            // The await is in a nested body, so it suspends that callback rather than the body holding the write.
            {
                code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); keys.forEach(async (each) => { await flush(); }); return Onyx.get(key); }`,
                errors: READ_AFTER_WRITE_ERRORS,
            },

            {code: `${ONYX_IMPORT} const {get} = Onyx; function submit() { Onyx.merge(key, value); return get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} const {merge} = Onyx; function submit() { merge(key, value); return Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},

            // Ordering inside one statement, and a write whose failure path still reaches the read.
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value), use(Onyx.get(key)); }`, errors: READ_AFTER_WRITE_ERRORS},
            {code: `${ONYX_IMPORT} function submit() { try { Onyx.merge(key, value); } catch (error) { use(Onyx.get(key)); } }`, errors: READ_AFTER_WRITE_ERRORS},

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

            // A read whose Promise is dropped is still a read after the write.
            {code: `${ONYX_IMPORT} function submit() { Onyx.merge(key, value); Onyx.get(key); }`, errors: READ_AFTER_WRITE_ERRORS},
        ],
    });
});
