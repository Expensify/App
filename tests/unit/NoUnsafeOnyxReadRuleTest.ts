/**
 * @jest-environment node
 */
import type {Rule} from 'eslint';

import {RuleTester} from 'eslint';
import path from 'path';
import {parser as tsParser} from 'typescript-eslint';

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

const tsRuleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parser: tsParser,
        parserOptions: {
            ecmaFeatures: {jsx: true},
        },
    },
});

const ONYX_IMPORT = "import Onyx from 'react-native-onyx';";
const ONYX_UTILS_IMPORT = "import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';";

const RENDER_ERRORS = [{messageId: 'noOnyxReadInRender'}];
const MODULE_SCOPE_ERRORS = [{messageId: 'noOnyxReadAtModuleScope'}];
const EFFECT_ERRORS = [{messageId: 'noOnyxReadInEffect'}];
const OUTSIDE_ALLOWED_PATH_ERRORS = [{messageId: 'noOnyxReadOutsideAllowedPath'}];
const OUTSIDE_COMPONENT_OR_HOOK_ERRORS = [{messageId: 'noOnyxReadOutsideComponentOrHook'}];
const BY_REFERENCE_ERROR = {messageId: 'noOnyxReadByReference'};
const BY_REFERENCE_ERRORS = [BY_REFERENCE_ERROR];
const OBJECT_AS_VALUE_ERROR = {messageId: 'noOnyxObjectAsValue'};
const OBJECT_AS_VALUE_ERRORS = [OBJECT_AS_VALUE_ERROR];

// The rule resolves the repo root from its own location, so the allowed-path cases use the same root it will compare against
function readRepoRoot(): string {
    const utilsModule: unknown = require('../../eslint-plugin-local-rules/utils/onyxReadUtils');
    const repoRoot: unknown = typeof utilsModule === 'object' && utilsModule !== null ? Reflect.get(utilsModule, 'REPO_ROOT') : null;

    if (typeof repoRoot !== 'string') {
        throw new TypeError('Expected onyxReadUtils to export REPO_ROOT as a string.');
    }

    return repoRoot;
}

const REPO_ROOT = readRepoRoot();

function inRepo(relativePath: string): string {
    return path.join(REPO_ROOT, relativePath);
}

const COMPONENT_FILE = inRepo('src/components/Foo.tsx');
const PAGE_FILE = inRepo('src/pages/Foo/index.tsx');

describe('no-unsafe-onyx-read', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            // A read in a function or method that nothing calls at render or import time runs on an event
            `${ONYX_IMPORT} export function submit() { const draft = Onyx.get(ONYXKEYS.SESSION); return draft; }`,
            `${ONYX_IMPORT} export default function handler() { return Onyx.get(ONYXKEYS.SESSION); }`,
            `${ONYX_IMPORT} const handlers = {onPress: () => Onyx.get(ONYXKEYS.SESSION)};`,
            `${ONYX_IMPORT} class Store { read() { return Onyx.get(ONYXKEYS.SESSION); } }`,

            `${ONYX_IMPORT} function Row() { const onPress = () => Onyx.get(ONYXKEYS.SESSION); return <View onPress={onPress} />; }`,
            `${ONYX_IMPORT} function Row() { return <View onPress={() => Onyx.get(ONYXKEYS.SESSION)} />; }`,
            `${ONYX_IMPORT} function Row() { function onPress() { return Onyx.get(ONYXKEYS.SESSION); } return <View onPress={onPress} />; }`,
            `${ONYX_IMPORT} function Row() { const onPress = async () => { await save(); return Onyx.get(ONYXKEYS.SESSION); }; return <View onPress={onPress} />; }`,

            `${ONYX_IMPORT} function Row() { const onPress = useCallback(() => Onyx.get(ONYXKEYS.SESSION), []); return <View onPress={onPress} />; }`,
            // onLoaded is an event callback, and a selector only counts on a hook call, not on an arbitrary configure()
            `${ONYX_IMPORT} function Row() { useOnyx(key, {onLoaded: () => Onyx.get(ONYXKEYS.ACCOUNT)}); return <View />; }`,
            `${ONYX_IMPORT} client.configure({selector: () => Onyx.get(ONYXKEYS.SESSION)});`,
            `${ONYX_IMPORT} function setup() { client.configure({selector: () => Onyx.get(ONYXKEYS.SESSION)}); }`,
            `${ONYX_IMPORT} const selector = (data) => Onyx.get(ONYXKEYS.SESSION); client.configure({selector});`,
            // A reducer runs on dispatch and a subscribe callback runs on mount; only the lazy initializer and the snapshot getters are render slots
            `${ONYX_IMPORT} function Row() { const [v] = useReducer((state, action) => Onyx.get(ONYXKEYS.SESSION), 0); return <View v={v} />; }`,
            `${ONYX_IMPORT} function Row() { const v = useSyncExternalStore((notify) => { Onyx.get(ONYXKEYS.SESSION); return noop; }, snapshot); return <View v={v} />; }`,
            `${ONYX_IMPORT} function Row() { const onPress = () => Onyx.get(ONYXKEYS.SESSION).then(setValue); return <View onPress={onPress} />; }`,
            // Class lifecycle methods are out of scope: the rule only follows hooks
            `${ONYX_IMPORT} class Row extends React.Component { componentDidMount() { Onyx.get(ONYXKEYS.SESSION).then(this.setValue); } }`,

            // A read inside a continuation runs after import time, so it is not a module-scope read
            `${ONYX_IMPORT} setTimeout(() => Onyx.get(ONYXKEYS.SESSION), 0);`,
            `${ONYX_IMPORT} ready.then(() => Onyx.get(ONYXKEYS.SESSION));`,
            `${ONYX_IMPORT} new Promise((resolve) => { ready.then(() => resolve(Onyx.get(ONYXKEYS.SESSION))); });`,
            `${ONYX_IMPORT} Onyx.init(config).then(() => Onyx.get(ONYXKEYS.SESSION));`,

            // Only the react-native-onyx import is tracked, so a read through OnyxUtils or an unrelated client is left to other rules
            `${ONYX_UTILS_IMPORT} const initialValue = OnyxUtils.get(ONYXKEYS.SESSION);`,
            "import cache from './cache'; const initialValue = cache.get(ONYXKEYS.SESSION);",

            // A global that is not the Onyx import is not a read, and mutating a read result is a documented convention the rule does not police
            `${ONYX_IMPORT} const api = window.somethingElse; function Row() { const value = api.get(ONYXKEYS.SESSION); return <View value={value} />; }`,
            `${ONYX_IMPORT} function f(key) { const pending = Onyx.get(ONYXKEYS.SESSION); pending.name = 'x'; return pending; }`,

            // A local object or window.Onyx is not the import, so these are not reads the rule tracks
            'const Onyx = {get: () => undefined}; const initialValue = Onyx.get(ONYXKEYS.SESSION);',
            'const Onyx = {get: () => undefined}; function Row() { const value = Onyx.get(ONYXKEYS.SESSION); return <View value={value} />; }',
            'const initialValue = window.Onyx.get(ONYXKEYS.SESSION);',
            'function Row() { return <View onLoad={window.Onyx.get(ONYXKEYS.SESSION)} />; }',

            // Only get and multiGet are reads
            `${ONYX_IMPORT} Onyx.init({keys: ONYXKEYS});`,
            `${ONYX_IMPORT} function Row() { Onyx.merge(key, value); return <View />; }`,
            `${ONYX_IMPORT} function submit() { return Onyx.get(ONYXKEYS.SESSION); }`,

            `${ONYX_IMPORT} function submit(policyID) { Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, values); return Onyx.get(\`\${ONYXKEYS.COLLECTION.POLICY_TAGS}\${policyID}\`); }`,

            `${ONYX_IMPORT} function submit() { if (shouldWrite) { Onyx.merge(key, value); } else { use(Onyx.get(ONYXKEYS.SESSION)); } }`,

            // A helper that reads is fine when only handlers call it
            `${ONYX_IMPORT} function Row() { const read = () => Onyx.get(ONYXKEYS.SESSION); const onPress = () => read(); return <View onPress={onPress} />; }`,
            `${ONYX_IMPORT} function load() { return Onyx.get(ONYXKEYS.SESSION); } function Row() { return <View onPress={() => load()} />; }`,
            `${ONYX_IMPORT} const handlers = {load: () => Onyx.get(ONYXKEYS.SESSION)}; function Row() { return <View onPress={() => handlers.load()} />; }`,
            // Only the named property and only `this` of the same class count as the handler
            `${ONYX_IMPORT} const api = {load: () => Onyx.get(ONYXKEYS.SESSION), other: () => 1}; function Row() { return <View value={api.other()} />; }`,
            `${ONYX_IMPORT} class Row extends React.Component { load = () => Onyx.get(ONYXKEYS.SESSION); render() { return <View value={this.props.load()} />; } }`,
            `${ONYX_IMPORT} class Outer extends React.Component { load = () => Onyx.get(ONYXKEYS.SESSION); render() { class Inner { load() { return 1; } render = () => <View value={this.load()} />; } return <View inner={Inner} />; } }`,
            // A handler that calls itself through its holder must not loop the escalation
            `${ONYX_IMPORT} const api = {load() { Onyx.get(ONYXKEYS.SESSION); return api.load(); }}; function Row() { return <View onPress={() => api.load()} />; }`,
            // A non-arrow function rebinds `this`, so its `this.load()` is not the class member
            `${ONYX_IMPORT} class Row extends React.Component { load = () => Onyx.get(ONYXKEYS.SESSION); render() { const values = ids.map(function () { return this.load(); }); return <View values={values} />; } }`,
            // A lowercase name with no JSX is a plain function
            `${ONYX_IMPORT} function username() { return Onyx.get(ONYXKEYS.SESSION); }`,
            // A function returned from a factory is a value; only the call site decides
            `${ONYX_IMPORT} function Row() { const makeHandler = () => () => Onyx.get(ONYXKEYS.SESSION); useEffect(() => { emitter.on('change', makeHandler()); }, []); return <View />; }`,
            // Given a useCallback callback that reads Onyx and returns a plain value, not JSX
            // When it is only passed as onPress
            // Then it is an event handler, so the read is allowed
            `${ONYX_IMPORT} function Row() { const onPress = useCallback(() => { Onyx.get(ONYXKEYS.SESSION); return 1; }, []); return <View onPress={onPress} />; }`,
            // Given a reading function passed by reference to useCallback
            // When the wrapped callback is only passed as onPress
            // Then the alias is followed to an event handler, so the read is allowed
            `${ONYX_IMPORT} function load() { return Onyx.get(ONYXKEYS.SESSION); } function Row() { const run = useCallback(load, []); return <View onPress={run} />; }`,
            // Given a useMemo factory that returns a reading function
            // When the memoized function is only passed as onPress
            // Then it is an event handler, so the read is allowed
            `${ONYX_IMPORT} function Row() { const read = useMemo(() => () => Onyx.get(ONYXKEYS.SESSION), []); return <View onPress={read} />; }`,
            // Given an object method named like a hook
            // When nothing calls it at render or import time
            // Then a property key is not a hook name, so the method is a plain function
            `${ONYX_IMPORT} const hooks = {useSession() { return Onyx.get(ONYXKEYS.SESSION); }};`,
            {
                // Given a handler map in a component whose arrow sits under a capitalized key
                // When a press handler calls the stored handler
                // Then a property key is not a component name, so the read is an event read
                code: `${ONYX_IMPORT} function Foo({action}) { const actionHandlers = {APPROVE: async () => { await Onyx.get(ONYXKEYS.ACCOUNT); }}; return <View onPress={() => actionHandlers[action]()} />; }`,
                filename: PAGE_FILE,
            },
            {
                // Given a keyboard handler map in a component with a capitalized method name
                // When a press handler calls the method
                // Then the method is not a component, so the read is an event read
                code: `${ONYX_IMPORT} function Foo() { const keyHandlers = {async Enter() { await Onyx.get(ONYXKEYS.ACCOUNT); }}; return <View onPress={() => keyHandlers.Enter()} />; }`,
                filename: PAGE_FILE,
            },
            {
                // Given Array.from with a reading map function in a press handler
                // When the handler runs on press
                // Then Array.from runs the callback inside the handler, so the read is an event read
                code: `${ONYX_IMPORT} function Row({ids}) { const onPress = () => Promise.all(Array.from(ids, (id) => Onyx.get(\`\${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}\${id}\`))); return <View onPress={onPress} />; }`,
            },
            {
                // Given an in-component reading helper passed by reference to map in a press handler
                // When the handler runs on press
                // Then map runs the helper inside the handler, so the read is an event read
                code: `${ONYX_IMPORT} function Row({ids}) { const getDraft = (id) => Onyx.get(\`\${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}\${id}\`); const onPress = () => Promise.all(ids.map(getDraft)); return <View onPress={onPress} />; }`,
            },
            {
                // Given an in-component reading helper handed to setTimeout in the render body
                // When the component renders
                // Then the timer runs the helper after render, so it is not a render read
                code: `${ONYX_IMPORT} function Row() { const load = () => Onyx.get(ONYXKEYS.SESSION); setTimeout(load, 0); return <View />; }`,
            },
        ],
        invalid: [
            {code: `${ONYX_IMPORT} new Promise((resolve) => { resolve(Onyx.get(ONYXKEYS.SESSION)); });`, errors: MODULE_SCOPE_ERRORS},

            {code: `${ONYX_IMPORT} function Row() { const value = use(Onyx.get(ONYXKEYS.SESSION)); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { Onyx.get(ONYXKEYS.SESSION).then(setValue); return <View />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function useReportName() { return use(Onyx.get(ONYXKEYS.SESSION)); }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const value = React.use(Onyx.get(ONYXKEYS.SESSION)); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const promise = Onyx.get(ONYXKEYS.SESSION); return <View value={use(promise)} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} async function Row() { const value = await Onyx.get(ONYXKEYS.SESSION); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = forwardRef((props, ref) => { Onyx.get(ONYXKEYS.SESSION).then(setValue); return <View ref={ref} />; });`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} class Row extends React.Component { render() { Onyx.get(ONYXKEYS.SESSION).then(this.setValue); return <View />; } }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function useReportName() { Onyx.get(ONYXKEYS.SESSION).then(setState); }`, errors: RENDER_ERRORS},

            {code: `${ONYX_IMPORT} function Row() { const value = Onyx.get(ONYXKEYS.SESSION); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = () => { const value = Onyx.get(ONYXKEYS.SESSION); return <View value={value} />; };`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function useThing() { return Onyx.get(ONYXKEYS.SESSION); }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const useReportName = () => Onyx.get(ONYXKEYS.SESSION);`, errors: RENDER_ERRORS},

            {code: `${ONYX_IMPORT} export default function() { const value = Onyx.get(ONYXKEYS.SESSION); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = memo(() => { const value = Onyx.get(ONYXKEYS.SESSION); return <View value={value} />; });`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = memo(function () { const value = Onyx.get(ONYXKEYS.SESSION); return <View value={value} />; });`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = forwardRef((props, ref) => { const value = Onyx.get(ONYXKEYS.SESSION); return <View ref={ref} value={value} />; });`, errors: RENDER_ERRORS},

            {code: `${ONYX_IMPORT} function Row() { return <Text>{Onyx.get(ONYXKEYS.SESSION)}</Text>; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { return <View style={Onyx.get(ONYXKEYS.SESSION)} />; }`, errors: RENDER_ERRORS},

            {
                code: `${ONYX_IMPORT} function Row() { const value = useSyncExternalStore(subscribe, () => Onyx.get(ONYXKEYS.SESSION)); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} function Row() { const value = useSyncExternalStore(subscribe, snapshot, () => Onyx.get(ONYXKEYS.SESSION)); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },

            {code: `${ONYX_IMPORT} function Row() { const value = useMemo(() => Onyx.get(ONYXKEYS.SESSION), []); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const value = React.useMemo(() => Onyx.get(ONYXKEYS.SESSION), []); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const [value] = useState(() => Onyx.get(ONYXKEYS.SESSION)); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const [value] = useReducer(reducer, key, (k) => Onyx.get(ONYXKEYS.SESSION)); return <View value={value} />; }`, errors: RENDER_ERRORS},

            {
                code: `${ONYX_IMPORT} function Row() { const [value] = useOnyx(key, {selector: (data) => Onyx.get(ONYXKEYS.ACCOUNT)}); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} function useThing() { return useOnyx(key, {selector: (data) => { const extra = Onyx.get(ONYXKEYS.ACCOUNT); return {...data, extra}; }}); }`,
                errors: RENDER_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} function Row() { const p = usePolicy(id, {selector: (data) => Onyx.get(ONYXKEYS.ACCOUNT)}); return <View p={p} />; }`,
                errors: RENDER_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} function Row() { const selector = (data) => Onyx.get(ONYXKEYS.ACCOUNT); const [value] = useOnyx(key, {selector}); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} function Row() { const pickAccount = (data) => Onyx.get(ONYXKEYS.ACCOUNT); const [value] = useOnyx(key, {selector: pickAccount}); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} function pickAccount(data) { return Onyx.get(ONYXKEYS.ACCOUNT); } function Row() { const [value] = useOnyx(key, {selector: pickAccount}); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} const pickAccount = (data) => Onyx.get(ONYXKEYS.ACCOUNT); const selector = pickAccount; function Row() { const [value] = useOnyx(key, {selector}); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} function Row() { const compute = () => Onyx.get(ONYXKEYS.SESSION); const value = useMemo(compute, []); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },

            // A same-file helper called from a render body runs the read during render
            {code: `${ONYX_IMPORT} function Row() { const read = () => Onyx.get(ONYXKEYS.SESSION); const value = read(); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {
                code: `${ONYX_IMPORT} function Row() { const read = useCallback(() => Onyx.get(ONYXKEYS.SESSION), []); const value = read(); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {
                // Given a useCallback callback that reads Onyx and returns JSX
                // When FlatList calls it as renderItem while rendering
                // Then the read is a render read, even though nothing in the file calls the callback directly
                code: `${ONYX_IMPORT} function List() { const renderItem = useCallback(({item}) => { const value = use(Onyx.get(ONYXKEYS.SESSION)); return <Row value={value} />; }, []); return <FlatList renderItem={renderItem} />; }`,
                errors: RENDER_ERRORS,
            },
            {
                // Given a reading function passed by reference to useCallback
                // When the wrapped callback is called in the render body
                // Then the alias is followed and the read is a render read
                code: `${ONYX_IMPORT} function load() { return Onyx.get(ONYXKEYS.SESSION); } function Row() { const run = useCallback(load, []); const value = run(); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {
                // Given a useMemo factory whose expression body is a reading function
                // When the memoized function is called in the render body
                // Then the memoized binding is followed and the read is a render read
                code: `${ONYX_IMPORT} function Row() { const read = useMemo(() => () => Onyx.get(ONYXKEYS.SESSION), []); const value = read(); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {
                // Given a useMemo factory that returns a reading function from a block body
                // When the memoized function is called in the render body
                // Then the memoized binding is followed and the read is a render read
                code: `${ONYX_IMPORT} function Row() { const read = useMemo(() => { return () => Onyx.get(ONYXKEYS.SESSION); }, []); const value = read(); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {code: `${ONYX_IMPORT} function load() { return Onyx.get(ONYXKEYS.SESSION); } function Row() { const value = load(); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {
                code: `${ONYX_IMPORT} function load() { return Onyx.get(ONYXKEYS.SESSION); } function wrap() { return load(); } function Row() { const value = wrap(); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {code: `${ONYX_IMPORT} async function load() { return (await Onyx.get(ONYXKEYS.SESSION))?.email; } function useEmail() { return load(); }`, errors: RENDER_ERRORS},
            {
                code: `${ONYX_IMPORT} function Row() { const read = () => Onyx.get(ONYXKEYS.SESSION); const values = ids.map(() => read()); return <View values={values} />; }`,
                errors: RENDER_ERRORS,
            },
            // A helper stored on an object or a class is followed through `holder.key()` and `this.key()`
            {code: `${ONYX_IMPORT} const api = {load() { return Onyx.get(ONYXKEYS.SESSION); }}; function Row() { return <View value={api.load()} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const api = {load: () => Onyx.get(ONYXKEYS.SESSION)}; function Row() { const value = api.load(); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {
                code: `${ONYX_IMPORT} class Row extends React.Component { load = () => Onyx.get(ONYXKEYS.SESSION); render() { return <View value={this.load()} />; } }`,
                errors: RENDER_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} class Row extends React.Component { load() { return Onyx.get(ONYXKEYS.SESSION); } render() { const value = this.load(); return <View value={value} />; } }`,
                errors: RENDER_ERRORS,
            },
            // A helper with JSX behind a conditional is a render body
            {code: `${ONYX_IMPORT} function row(v) { const value = use(Onyx.get(ONYXKEYS.SESSION)); return v ? <Row value={value} /> : null; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const row = (v) => (v && <Row value={use(Onyx.get(ONYXKEYS.SESSION))} />);`, errors: RENDER_ERRORS},
            {
                // Given an object method under a capitalized key that returns JSX
                // When something renders it
                // Then returnsJSX makes it a render body even though the key is not a component name
                code: `${ONYX_IMPORT} const Components = {Header: () => { const value = Onyx.get(ONYXKEYS.SESSION); return <View value={value} />; }};`,
                errors: RENDER_ERRORS,
            },
            // A selector in a const-bound options object reaches the hook the same way
            {
                code: `${ONYX_IMPORT} function Row() { const options = {selector: (data) => Onyx.get(ONYXKEYS.ACCOUNT)}; const [value] = useOnyx(key, options); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            // Aliases resolve by binding, not by source order, and a let alias still counts as a possible read
            {
                code: `${ONYX_IMPORT} function Row() { const value = read(ONYXKEYS.SESSION); return <View value={value} />; } const read = Onyx.get;`,
                errors: [{messageId: 'noOnyxReadInRender'}, BY_REFERENCE_ERROR],
            },
            {
                // Given a render read through an Onyx alias declared after the component
                // When the rule checks the call and the alias
                // Then the alias resolves by binding, so the read is a render read, and the alias is a value use
                code: `${ONYX_IMPORT} function Row() { const value = api.get(ONYXKEYS.SESSION); return <View value={value} />; } const api = Onyx;`,
                errors: [...RENDER_ERRORS, OBJECT_AS_VALUE_ERROR],
            },
            {
                code: `${ONYX_IMPORT} let read = Onyx.get; function Row() { const value = read(ONYXKEYS.SESSION); return <View value={value} />; }`,
                errors: [BY_REFERENCE_ERROR, {messageId: 'noOnyxReadInRender'}],
            },
            {
                code: `${ONYX_IMPORT} function Row() { const value = read(ONYXKEYS.SESSION); return <View value={value} />; } const {get: read} = Onyx;`,
                errors: [{messageId: 'noOnyxReadInRender'}, BY_REFERENCE_ERROR],
            },
            {code: `import * as Onyx from 'react-native-onyx'; const initialValue = Onyx.get(ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},
            // An alias of an alias is still a read
            {
                code: `${ONYX_IMPORT} const read = Onyx.get; const read2 = read; function Row() { const value = read2(ONYXKEYS.SESSION); return <View value={value} />; }`,
                errors: [BY_REFERENCE_ERROR, {messageId: 'noOnyxReadInRender'}],
            },
            // The object and read-method questions are cached separately
            {
                code: `${ONYX_IMPORT} const {get: read} = Onyx; function Row() { read.get(ONYXKEYS.SESSION); const value = read(ONYXKEYS.SESSION); return <View value={value} />; }`,
                errors: [BY_REFERENCE_ERROR, {messageId: 'noOnyxReadInRender'}],
            },
            // A same-file helper called at module scope runs the read at import time
            {code: `${ONYX_IMPORT} function load() { return Onyx.get(ONYXKEYS.SESSION); } export const initialValue = load();`, errors: MODULE_SCOPE_ERRORS},

            {code: `${ONYX_IMPORT} function Row() { const value = (() => Onyx.get(ONYXKEYS.SESSION))(); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { new Promise(() => Onyx.get(ONYXKEYS.SESSION)); return <View />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { new Promise((resolve) => { resolve(Onyx.get(ONYXKEYS.SESSION)); }); return <View />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const values = ids.map((id) => Onyx.get(ONYXKEYS.SESSION)); return <View values={values} />; }`, errors: RENDER_ERRORS},
            {
                code: `${ONYX_IMPORT} function Row() { const values = ids.filter((id) => Onyx.get(ONYXKEYS.SESSION)).map((id) => id); return <View values={values} />; }`,
                errors: RENDER_ERRORS,
            },

            {code: `${ONYX_IMPORT} function Row() { const value = Onyx['get'](ONYXKEYS.SESSION); return <View value={value} />; }`, errors: RENDER_ERRORS},

            {
                code: `${ONYX_IMPORT} const {get} = Onyx; function Row() { const value = get(ONYXKEYS.SESSION); return <View value={value} />; }`,
                errors: [BY_REFERENCE_ERROR, {messageId: 'noOnyxReadInRender'}],
            },
            {
                code: `${ONYX_IMPORT} const {get: readOnyx} = Onyx; function Row() { const value = readOnyx(ONYXKEYS.SESSION); return <View value={value} />; }`,
                errors: [BY_REFERENCE_ERROR, {messageId: 'noOnyxReadInRender'}],
            },
            {
                code: `${ONYX_IMPORT} const readOnyx = Onyx.get; function Row() { const value = readOnyx(ONYXKEYS.SESSION); return <View value={value} />; }`,
                errors: [BY_REFERENCE_ERROR, {messageId: 'noOnyxReadInRender'}],
            },

            {
                code: `${ONYX_IMPORT} function Row() { const a = Onyx.get(ONYXKEYS.SESSION); const b = Onyx.get(ONYXKEYS.ACCOUNT); return <View a={a} b={b} />; }`,
                errors: [{messageId: 'noOnyxReadInRender'}, {messageId: 'noOnyxReadInRender'}],
            },

            {code: `${ONYX_IMPORT} function row() { const el = <View a={Onyx.get(ONYXKEYS.SESSION)} />; return el; }`, errors: RENDER_ERRORS},

            {code: `${ONYX_IMPORT} const initialValue = Onyx.get(ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} export const session = Onyx.get(ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} let cached; cached = Onyx.get(ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} if (shouldPreload) { const value = Onyx.get(ONYXKEYS.SESSION); use(value); }`, errors: MODULE_SCOPE_ERRORS},

            {code: `${ONYX_IMPORT} const initialValue = (() => Onyx.get(ONYXKEYS.SESSION))();`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} const values = keys.map((key) => Onyx.get(ONYXKEYS.SESSION));`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} const present = keys.filter((key) => Onyx.get(ONYXKEYS.SESSION)).map((key) => key);`, errors: MODULE_SCOPE_ERRORS},

            {code: `${ONYX_IMPORT} const initialValue = Onyx['get'](ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},

            {code: `${ONYX_IMPORT} const {get} = Onyx; const initialValue = get(ONYXKEYS.SESSION);`, errors: [BY_REFERENCE_ERROR, {messageId: 'noOnyxReadAtModuleScope'}]},
            {code: `${ONYX_IMPORT} const {get: readOnyx} = Onyx; const initialValue = readOnyx(ONYXKEYS.SESSION);`, errors: [BY_REFERENCE_ERROR, {messageId: 'noOnyxReadAtModuleScope'}]},
            {code: `${ONYX_IMPORT} const readOnyx = Onyx.get; const initialValue = readOnyx(ONYXKEYS.SESSION);`, errors: [BY_REFERENCE_ERROR, {messageId: 'noOnyxReadAtModuleScope'}]},

            {
                code: `${ONYX_IMPORT} const a = Onyx.get(ONYXKEYS.SESSION); const b = Onyx.get(ONYXKEYS.ACCOUNT);`,
                errors: [{messageId: 'noOnyxReadAtModuleScope'}, {messageId: 'noOnyxReadAtModuleScope'}],
            },

            {code: `${ONYX_IMPORT} const el = <View a={Onyx.get(ONYXKEYS.SESSION)} />;`, errors: MODULE_SCOPE_ERRORS},

            {code: `${ONYX_IMPORT} Onyx.merge(key, value); const restored = Onyx.get(ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},

            {
                // Given a render read through an alias of the Onyx object
                // When the rule checks the alias and the call
                // Then the alias line is a value use of the Onyx object, and the read through it is still tracked
                code: `${ONYX_IMPORT} const api = Onyx; function Row() { const value = api.get(ONYXKEYS.SESSION); return <View value={value} />; }`,
                errors: [OBJECT_AS_VALUE_ERROR, ...RENDER_ERRORS],
            },
            {
                // Given a render read through an alias of an alias of the Onyx object
                // When the rule checks the aliases and the call
                // Then only the first alias uses the import as a value, and the read is still tracked through both
                code: `${ONYX_IMPORT} const api = Onyx; const alias = api; function Row() { return <View value={alias.get(ONYXKEYS.SESSION)} />; }`,
                errors: [OBJECT_AS_VALUE_ERROR, ...RENDER_ERRORS],
            },
            {
                // Given an alias of the Onyx object called as a function
                // When the rule checks the call and the alias
                // Then calling the object is not a read, so only the alias is reported as a value use
                code: `${ONYX_IMPORT} const api = Onyx; function Row() { const value = api(ONYXKEYS.SESSION); return <View value={value} />; }`,
                errors: OBJECT_AS_VALUE_ERRORS,
            },

            {code: `${ONYX_IMPORT} function Row() { Onyx.merge(key, value); const a = Onyx.get(ONYXKEYS.SESSION); return <View a={a} />; }`, errors: RENDER_ERRORS},
            {
                // Given Array.from with a reading map function in the render body
                // When the component renders
                // Then Array.from runs the callback synchronously, so the read is a render read
                code: `${ONYX_IMPORT} function Row({ids}) { const drafts = use(Promise.all(Array.from(ids, (id) => Onyx.get(\`\${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}\${id}\`)))); return <View drafts={drafts} />; }`,
                errors: RENDER_ERRORS,
            },
            {
                // Given an in-component reading helper passed by reference to map in the render body
                // When the component renders
                // Then map runs the helper synchronously, so the read is a render read
                code: `${ONYX_IMPORT} function Row({ids}) { const getDraft = (id) => Onyx.get(\`\${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}\${id}\`); const drafts = use(Promise.all(ids.map(getDraft))); return <View drafts={drafts} />; }`,
                errors: RENDER_ERRORS,
            },
            {
                // Given an in-component reading helper passed by reference as a Promise executor in the render body
                // When the component renders
                // Then the executor runs synchronously, so the read is a render read
                code: `${ONYX_IMPORT} function Row() { const load = (resolve) => resolve(Onyx.get(ONYXKEYS.SESSION)); const value = use(new Promise(load)); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
        ],
    });
});

describe('no-unsafe-onyx-read under the TypeScript parser', () => {
    tsRuleTester.run(ruleModule.name, ruleModule, {
        valid: [
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.get(ONYXKEYS.SESSION as OnyxKey); }`},
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.get(ONYXKEYS.SESSION!); }`},
            {code: `${ONYX_IMPORT} export function submit(): Promise<unknown> { return Onyx.get(ONYXKEYS.SESSION); }`},
        ],
        invalid: [
            {
                code: `${ONYX_IMPORT} function Row({id}: {id: string}) { const value = Onyx.get(ONYXKEYS.SESSION as OnyxKey); return <View value={value} id={id} />; }`,
                errors: RENDER_ERRORS,
            },
            // A cast around the Onyx object does not hide the read
            {code: `${ONYX_IMPORT} function Row() { const value = (Onyx as typeof Onyx).get(ONYXKEYS.SESSION); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const value = Onyx!.get(ONYXKEYS.SESSION); return <View value={value} />; }`, errors: RENDER_ERRORS},
            // A cast on the callee is unwrapped like a cast on the object
            {code: `${ONYX_IMPORT} function Row() { const value = (Onyx.get as typeof Onyx.get)(ONYXKEYS.SESSION); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {
                // Given a render read through an alias of the Onyx object behind a cast
                // When the rule unwraps the cast
                // Then the alias is a value use, and the read through it is still a render read
                code: `${ONYX_IMPORT} const api = Onyx as typeof Onyx; function Row() { const value = api.get(ONYXKEYS.SESSION); return <View value={value} />; }`,
                errors: [OBJECT_AS_VALUE_ERROR, ...RENDER_ERRORS],
            },
            {
                code: `${ONYX_IMPORT} function Row() { const options = {selector: (data: unknown) => Onyx.get(ONYXKEYS.ACCOUNT)} as const; const [value] = useOnyx(key, options); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {code: `${ONYX_IMPORT} const initialValue = Onyx.get(ONYXKEYS.SESSION as OnyxKey);`, errors: MODULE_SCOPE_ERRORS},
            {
                // Given a selector in an inline options object cast with `as const`
                // When useOnyx runs the selector during render
                // Then the cast does not hide the hook call and the read is a render read
                code: `${ONYX_IMPORT} function Row() { const [value] = useOnyx(key, {selector: () => Onyx.get(ONYXKEYS.SESSION)} as const); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {
                // Given a selector in an inline options object checked with `satisfies`
                // When useOnyx runs the selector during render
                // Then the check does not hide the hook call and the read is a render read
                code: `${ONYX_IMPORT} function Row() { const [value] = useOnyx(key, {selector: () => Onyx.get(ONYXKEYS.SESSION)} satisfies Record<string, unknown>); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {
                // Given a selector in a const options object that is cast where it is passed to useOnyx
                // When useOnyx runs the selector during render
                // Then the cast at the use site does not hide the hook call and the read is a render read
                code: `${ONYX_IMPORT} function Row() { const options = {selector: () => Onyx.get(ONYXKEYS.SESSION)}; const [value] = useOnyx(key, options as typeof options); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
        ],
    });
});

describe('no-unsafe-onyx-read effects', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            `${ONYX_IMPORT} function Row() { useEffect(() => { const subscription = emitter.addListener('change', () => Onyx.get(ONYXKEYS.SESSION)); return () => subscription.remove(); }, []); return <View />; }`,
            `${ONYX_IMPORT} function Row() { const onChange = () => Onyx.get(ONYXKEYS.SESSION); useEffect(() => { window.addEventListener('focus', onChange); return () => window.removeEventListener('focus', onChange); }, [onChange]); return <View />; }`,
            `${ONYX_IMPORT} function useThing() { const onShortcut = () => Onyx.get(ONYXKEYS.SESSION); useEffect(() => registerShortcut(onShortcut), [onShortcut]); }`,
            `${ONYX_IMPORT} function Row() { const load = () => Onyx.get(ONYXKEYS.SESSION); useEffect(() => {}, [load]); return <View onPress={load} />; }`,
            `${ONYX_IMPORT} function Row() { const load = useCallback(() => Onyx.get(ONYXKEYS.SESSION), []); const run = () => load(); return <View onPress={run} />; }`,
            `${ONYX_IMPORT} function Row() { const onPress = () => Onyx.get(ONYXKEYS.SESSION); useEffect(() => { track(); }, []); return <View onPress={onPress} />; }`,
            // Given a startTransition callback that reads Onyx inside a press handler
            // When the handler runs on press
            // Then no effect reaches it, so the read is an event read
            `${ONYX_IMPORT} function Row() { const onPress = () => { startTransition(() => { Onyx.get(ONYXKEYS.SESSION).then(setValue); }); }; return <View onPress={onPress} />; }`,
        ],
        invalid: [
            {
                code: `${ONYX_IMPORT} function Row() { const load = () => Onyx.get(ONYXKEYS.SESSION); useEffect(() => { const id = setTimeout(load, 0); return () => clearTimeout(id); }, []); return <View />; }`,
                errors: EFFECT_ERRORS,
            },
            {code: `${ONYX_IMPORT} function Row() { useEffect(() => { items.forEach(() => Onyx.get(ONYXKEYS.SESSION)); }, []); return <View />; }`, errors: EFFECT_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const onPress = () => Onyx.get(ONYXKEYS.SESSION); useEffect(onPress, []); return <View onPress={onPress} />; }`, errors: EFFECT_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { useEffect(() => { use(Onyx.get(ONYXKEYS.SESSION)); }, []); return <View />; }`, errors: EFFECT_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { useLayoutEffect(() => { use(Onyx.get(ONYXKEYS.SESSION)); }, []); return <View />; }`, errors: EFFECT_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { useFocusEffect(useCallback(() => { Onyx.get(ONYXKEYS.SESSION); }, [])); return <View />; }`, errors: EFFECT_ERRORS},
            {
                code: `${ONYX_IMPORT} function Row() { const onFocus = useCallback(() => { Onyx.get(ONYXKEYS.SESSION); }, []); useFocusEffect(onFocus); return <View />; }`,
                errors: EFFECT_ERRORS,
            },
            {code: `${ONYX_IMPORT} function Row() { useEffect(() => { ready.then(() => Onyx.get(ONYXKEYS.SESSION)); }, []); return <View />; }`, errors: EFFECT_ERRORS},
            {
                code: `${ONYX_IMPORT} function Row() { const load = async () => { await Onyx.get(ONYXKEYS.SESSION); }; useEffect(() => { load(); }, []); return <View />; }`,
                errors: EFFECT_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} function Row() { function load() { return Onyx.get(ONYXKEYS.SESSION); } useLayoutEffect(() => { load(); }, []); return <View />; }`,
                errors: EFFECT_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} function Row() { const load = useCallback(async () => { await Onyx.get(ONYXKEYS.SESSION); }, []); useEffect(() => { load(); }, [load]); return <View onPress={load} />; }`,
                errors: EFFECT_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} function Row() { const load = () => Onyx.get(ONYXKEYS.SESSION); const run = () => { load(); }; useEffect(() => { run(); }, []); return <View onPress={run} />; }`,
                errors: EFFECT_ERRORS,
            },
            {code: `${ONYX_IMPORT} function useThing() { const load = () => Onyx.get(ONYXKEYS.SESSION); useEffect(() => { ready.then(load); }, []); }`, errors: EFFECT_ERRORS},

            // useEffectEvent callbacks are handlers an effect calls
            {
                code: `${ONYX_IMPORT} function Row() { const onTick = useEffectEvent(() => Onyx.get(ONYXKEYS.SESSION)); useEffect(() => { onTick(); }, []); return <View />; }`,
                errors: EFFECT_ERRORS,
            },
            // An effect cleanup runs from the effect too
            {code: `${ONYX_IMPORT} function Row() { useEffect(() => () => { Onyx.get(ONYXKEYS.SESSION); }, []); return <View />; }`, errors: EFFECT_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { useEffect(() => { return () => { Onyx.get(ONYXKEYS.SESSION); }; }, []); return <View />; }`, errors: EFFECT_ERRORS},
            // Timers and interaction callbacks scheduled from an effect
            {code: `${ONYX_IMPORT} function Row() { useEffect(() => { setInterval(() => Onyx.get(ONYXKEYS.SESSION), 100); }, []); return <View />; }`, errors: EFFECT_ERRORS},
            {
                code: `${ONYX_IMPORT} function Row() { const load = () => Onyx.get(ONYXKEYS.SESSION); useEffect(() => { InteractionManager.runAfterInteractions(load); }, []); return <View />; }`,
                errors: EFFECT_ERRORS,
            },
            {
                // Given a reading function passed by reference to useCallback
                // When an effect calls the wrapped callback
                // Then the alias is followed and the read is an effect read
                code: `${ONYX_IMPORT} function load() { return Onyx.get(ONYXKEYS.SESSION); } function Row() { const run = useCallback(load, []); useEffect(() => { run(); }, [run]); return <View />; }`,
                errors: EFFECT_ERRORS,
            },
            {
                // Given a reading function passed by reference to useEffectEvent
                // When an effect calls the effect event
                // Then the alias is followed and the read is an effect read
                code: `${ONYX_IMPORT} function load() { return Onyx.get(ONYXKEYS.SESSION); } function Row() { const onLoad = useEffectEvent(load); useEffect(() => { onLoad(); }, []); return <View />; }`,
                errors: EFFECT_ERRORS,
            },
            {
                // Given a useMemo factory that returns a reading function
                // When an effect calls the memoized function
                // Then the memoized binding is followed and the read is an effect read
                code: `${ONYX_IMPORT} function Row() { const read = useMemo(() => () => Onyx.get(ONYXKEYS.SESSION), []); useEffect(() => { read(); }, [read]); return <View />; }`,
                errors: EFFECT_ERRORS,
            },
            // An alias of the handler is followed
            {
                code: `${ONYX_IMPORT} function Row() { const load = () => Onyx.get(ONYXKEYS.SESSION); const run = load; useEffect(() => { run(); }, []); return <View />; }`,
                errors: EFFECT_ERRORS,
            },
            // A handler stored on an object is followed through `holder.key()`
            {
                code: `${ONYX_IMPORT} const handlers = {load: () => Onyx.get(ONYXKEYS.SESSION)}; function Row() { useEffect(() => { void handlers.load(); }, []); return <View />; }`,
                errors: EFFECT_ERRORS,
            },
            {
                // Given a startTransition callback that reads Onyx inside an effect
                // When the effect runs
                // Then startTransition runs the callback from the effect, so the read is an effect read
                code: `${ONYX_IMPORT} function Row() { useEffect(() => { startTransition(() => { Onyx.get(ONYXKEYS.SESSION).then(setValue); }); }, []); return <View />; }`,
                errors: EFFECT_ERRORS,
            },
            {
                // Given a navigation microtask callback that reads Onyx inside an effect
                // When the effect runs
                // Then the callback is scheduled from the effect, so the read is an effect read
                code: `${ONYX_IMPORT} function Row() { useEffect(() => { Navigation.setNavigationActionToMicrotaskQueue(() => { Onyx.get(ONYXKEYS.SESSION).then(setValue); }); }, []); return <View />; }`,
                errors: EFFECT_ERRORS,
            },
            // useImperativeHandle runs its factory at commit, like a layout effect
            {code: `${ONYX_IMPORT} function Row(props, ref) { useImperativeHandle(ref, () => { Onyx.get(ONYXKEYS.SESSION); return {}; }, []); return <View />; }`, errors: EFFECT_ERRORS},
            {
                code: `${ONYX_IMPORT} function Row(props, ref) { const make = () => { Onyx.get(ONYXKEYS.SESSION); return {}; }; useImperativeHandle(ref, make, []); return <View />; }`,
                errors: EFFECT_ERRORS,
            },
        ],
    });
});

describe('no-unsafe-onyx-read allowed paths', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            {
                // Given a handler inside a component under src/components
                // When the rule checks the path
                // Then the directory allows event reads, so nothing is reported
                code: `${ONYX_IMPORT} function Foo() { const submit = async () => Onyx.get(ONYXKEYS.SESSION); return <View onPress={submit} />; }`,
                filename: inRepo('src/components/Foo.tsx'),
            },
            {
                // Given a handler inside a component under src/pages
                // When the rule checks the path
                // Then the directory allows event reads, so nothing is reported
                code: `${ONYX_IMPORT} function Foo() { const submit = async () => Onyx.get(ONYXKEYS.SESSION); return <View onPress={submit} />; }`,
                filename: inRepo('src/pages/Foo.tsx'),
            },
            {
                // Given a function returned from a hook under src/hooks
                // When the rule checks the path
                // Then the directory allows event reads, so nothing is reported
                code: `${ONYX_IMPORT} function useFoo() { const submit = async () => Onyx.get(ONYXKEYS.SESSION); return submit; }`,
                filename: inRepo('src/hooks/useFoo.ts'),
            },
            {code: `${ONYX_IMPORT} export async function submit() { return Onyx.get(ONYXKEYS.SESSION); }`, filename: inRepo('tests/unit/FooTest.ts')},
            {code: `${ONYX_IMPORT} export async function submit() { return Onyx.get(ONYXKEYS.SESSION); }`, filename: 'file.ts'},
        ],
        invalid: [
            {code: `${ONYX_IMPORT} export async function submit() { return Onyx.get(ONYXKEYS.SESSION); }`, filename: inRepo('src/libs/actions/Foo.ts'), errors: OUTSIDE_ALLOWED_PATH_ERRORS},
            {code: `${ONYX_IMPORT} export async function submit() { return Onyx.get(ONYXKEYS.SESSION); }`, filename: inRepo('src/libs/ReportUtils.ts'), errors: OUTSIDE_ALLOWED_PATH_ERRORS},
            {
                code: `${ONYX_IMPORT} export async function submit() { return Onyx.get(ONYXKEYS.SESSION); }`,
                filename: inRepo('src/setup/addUtilsToWindow.ts'),
                errors: OUTSIDE_ALLOWED_PATH_ERRORS,
            },
            {code: `${ONYX_IMPORT} export async function submit() { return Onyx.get(ONYXKEYS.SESSION); }`, filename: inRepo('src/CONST/index.ts'), errors: OUTSIDE_ALLOWED_PATH_ERRORS},
            {
                code: `${ONYX_IMPORT} const {get} = Onyx; export async function submit() { return get(ONYXKEYS.SESSION); }`,
                filename: inRepo('src/libs/Foo.ts'),
                errors: [BY_REFERENCE_ERROR, {messageId: 'noOnyxReadOutsideAllowedPath'}],
            },
            {
                code: `${ONYX_IMPORT} export async function submit() { return Onyx.get(ONYXKEYS.COLLECTION.REPORT); }`,
                filename: inRepo('src/libs/Foo.ts'),
                errors: OUTSIDE_ALLOWED_PATH_ERRORS,
            },
        ],
    });
});

describe('no-unsafe-onyx-read outside a component or hook', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            {
                // Given a read in a handler defined inside a function component
                // When the handler runs on press
                // Then the read is nested in the component, so it cannot be imported from src/libs
                code: `${ONYX_IMPORT} function Foo() { const onPress = () => Onyx.get(ONYXKEYS.SESSION); return <View onPress={onPress} />; }`,
                filename: COMPONENT_FILE,
            },
            {
                // Given a read in a handler defined inside a page component
                // When the handler runs on press
                // Then the read is nested in the component, so it is allowed under src/pages too
                code: `${ONYX_IMPORT} function Foo() { const onPress = () => Onyx.multiGet([ONYXKEYS.SESSION]); return <View onPress={onPress} />; }`,
                filename: PAGE_FILE,
            },
            {
                // Given a read in a handler inside an anonymous function that memo() wraps
                // When the handler runs on press
                // Then the memo() argument is the component, so the read is nested in it
                code: `${ONYX_IMPORT} const Foo = memo(() => { const onPress = () => Onyx.get(ONYXKEYS.SESSION); return <View onPress={onPress} />; });`,
                filename: COMPONENT_FILE,
            },
            {
                // Given a read in a handler inside an anonymous function that forwardRef() wraps
                // When the handler runs on press
                // Then the forwardRef() argument is the component, so the read is nested in it
                code: `${ONYX_IMPORT} const Foo = forwardRef((props, ref) => { const onPress = () => Onyx.get(ONYXKEYS.SESSION); return <View ref={ref} onPress={onPress} />; });`,
                filename: PAGE_FILE,
            },
            {
                // Given a read in a function a const-bound arrow hook returns
                // When the caller runs the returned function on an event
                // Then the read is nested in the hook
                code: `${ONYX_IMPORT} const useThing = () => { const load = () => Onyx.get(ONYXKEYS.SESSION); return load; };`,
                filename: inRepo('src/hooks/useThing.ts'),
            },
            {
                // Given a read in an object method defined inside a component
                // When a handler calls the method on press
                // Then the method is nested in the component, so it counts as inside it
                code: `${ONYX_IMPORT} function Foo() { const api = {load() { return Onyx.get(ONYXKEYS.SESSION); }}; return <View onPress={() => api.load()} />; }`,
                filename: COMPONENT_FILE,
            },
            {
                // Given a read in a class method where the class is defined inside a component
                // When a handler calls the method on press
                // Then the method is nested in the component, so it counts as inside it
                code: `${ONYX_IMPORT} function Foo() { class Loader { load() { return Onyx.get(ONYXKEYS.SESSION); } } const loader = new Loader(); return <View onPress={() => loader.load()} />; }`,
                filename: PAGE_FILE,
            },
            {
                // Given a module-level helper that reads Onyx in a test file
                // When suites call it from an it block
                // Then tests are exempt from the position check, since nothing in src imports them
                code: `${ONYX_IMPORT} function readSession() { return Onyx.get(ONYXKEYS.SESSION); } it('reads', async () => { await readSession(); });`,
                filename: inRepo('tests/unit/Foo.ts'),
            },
        ],
        invalid: [
            {
                // Given an exported module-level function that reads Onyx in a components file
                // When src/libs imports and calls it
                // Then the read escapes the directory check, so it is reported
                code: `${ONYX_IMPORT} export function readSession() { return Onyx.get(ONYXKEYS.SESSION); }`,
                filename: COMPONENT_FILE,
                errors: OUTSIDE_COMPONENT_OR_HOOK_ERRORS,
            },
            {
                // Given an exported module-level function that reads Onyx in a pages utils file
                // When src/libs imports and calls it
                // Then the read escapes the directory check, so it is reported
                code: `${ONYX_IMPORT} export function readSession() { return Onyx.get(ONYXKEYS.SESSION); }`,
                filename: inRepo('src/pages/workspace/utils.ts'),
                errors: OUTSIDE_COMPONENT_OR_HOOK_ERRORS,
            },
            {
                // Given an exported async module-level function that reads Onyx in a hooks file
                // When src/libs imports and calls it
                // Then the read escapes the directory check, so it is reported
                code: `${ONYX_IMPORT} export async function submit() { return Onyx.get(ONYXKEYS.SESSION); }`,
                filename: inRepo('src/hooks/useFoo.ts'),
                errors: OUTSIDE_COMPONENT_OR_HOOK_ERRORS,
            },
            {
                // Given a module-level function that reads Onyx with multiGet
                // When src/libs imports and calls it
                // Then multiGet escapes the directory check the same way, so it is reported
                code: `${ONYX_IMPORT} export function readMany() { return Onyx.multiGet([ONYXKEYS.SESSION]); }`,
                filename: PAGE_FILE,
                errors: OUTSIDE_COMPONENT_OR_HOOK_ERRORS,
            },
            {
                // Given a module-level object literal method that reads Onyx in a components file
                // When the object is imported elsewhere
                // Then the method is not a component or hook, so the read is reported
                code: `${ONYX_IMPORT} const api = {load() { return Onyx.get(ONYXKEYS.SESSION); }};`,
                filename: COMPONENT_FILE,
                errors: OUTSIDE_COMPONENT_OR_HOOK_ERRORS,
            },
            {
                // Given a module-level object literal method that reads Onyx in a pages file
                // When the object is imported elsewhere
                // Then the method is not a component or hook, so the read is reported
                code: `${ONYX_IMPORT} const api = {load() { return Onyx.get(ONYXKEYS.SESSION); }};`,
                filename: PAGE_FILE,
                errors: OUTSIDE_COMPONENT_OR_HOOK_ERRORS,
            },
            {
                // Given a module-level class method that reads Onyx in a components file
                // When the class is imported elsewhere
                // Then a class is never a component here, so the read is reported
                code: `${ONYX_IMPORT} class Store { read() { return Onyx.get(ONYXKEYS.SESSION); } }`,
                filename: COMPONENT_FILE,
                errors: OUTSIDE_COMPONENT_OR_HOOK_ERRORS,
            },
            {
                // Given a module-level arrow that reads Onyx, passed as onPress by a component in a components file
                // When the component renders
                // Then the arrow is defined outside the component, so the read is reported
                code: `${ONYX_IMPORT} const load = () => Onyx.get(ONYXKEYS.SESSION); function Foo() { return <View onPress={load} />; }`,
                filename: COMPONENT_FILE,
                errors: OUTSIDE_COMPONENT_OR_HOOK_ERRORS,
            },
            {
                // Given a module-level arrow that reads Onyx, passed as onPress by a component in a pages file
                // When the component renders
                // Then the arrow is defined outside the component, so the read is reported
                code: `${ONYX_IMPORT} const load = () => Onyx.get(ONYXKEYS.SESSION); function Foo() { return <View onPress={load} />; }`,
                filename: PAGE_FILE,
                errors: OUTSIDE_COMPONENT_OR_HOOK_ERRORS,
            },
            {
                // Given a module-level helper that reads Onyx, called from a handler inside a component in a components file
                // When the rule checks both functions
                // Then the read sits in the helper on line 2, so that line is reported and the handler on line 3 is not
                code: `${ONYX_IMPORT}\nfunction readSession() { return Onyx.get(ONYXKEYS.SESSION); }\nfunction Foo() { const onPress = () => readSession(); return <View onPress={onPress} />; }`,
                filename: COMPONENT_FILE,
                errors: [{messageId: 'noOnyxReadOutsideComponentOrHook', line: 2}],
            },
            {
                // Given a module-level helper that reads Onyx, called from a handler inside a component in a pages file
                // When the rule checks both functions
                // Then the read sits in the helper on line 2, so that line is reported and the handler on line 3 is not
                code: `${ONYX_IMPORT}\nfunction readSession() { return Onyx.get(ONYXKEYS.SESSION); }\nfunction Foo() { const onPress = () => readSession(); return <View onPress={onPress} />; }`,
                filename: PAGE_FILE,
                errors: [{messageId: 'noOnyxReadOutsideComponentOrHook', line: 2}],
            },
        ],
    });
});

describe('no-unsafe-onyx-read multiGet', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            `${ONYX_IMPORT} function Row() { const onPress = async () => { const [session, account] = await Onyx.multiGet([ONYXKEYS.SESSION, ONYXKEYS.ACCOUNT]); submit(session, account); }; return <View onPress={onPress} />; }`,
            `${ONYX_IMPORT} export function submit(id) { return Onyx.multiGet([ONYXKEYS.SESSION, \`\${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}\${id}\`]); }`,
            `${ONYX_IMPORT} export function submit() { const keys = [ONYXKEYS.SESSION, ONYXKEYS.ACCOUNT]; return Onyx.multiGet(keys); }`,
            `${ONYX_IMPORT} export function submit() { return Onyx.multiGet([]); }`,

            'const Onyx = {multiGet: () => []}; function Row() { const value = Onyx.multiGet([ONYXKEYS.SESSION]); return <View value={value} />; }',
        ],
        invalid: [
            {code: `${ONYX_IMPORT} function Row() { const values = use(Onyx.multiGet([ONYXKEYS.SESSION])); return <View values={values} />; }`, errors: RENDER_ERRORS},

            {code: `${ONYX_IMPORT} const {multiGet} = Onyx; const initialValues = multiGet([ONYXKEYS.SESSION]);`, errors: [BY_REFERENCE_ERROR, {messageId: 'noOnyxReadAtModuleScope'}]},
            {
                code: `${ONYX_IMPORT} const readMany = Onyx.multiGet; function Row() { const values = readMany([ONYXKEYS.SESSION]); return <View values={values} />; }`,
                errors: [BY_REFERENCE_ERROR, {messageId: 'noOnyxReadInRender'}],
            },
        ],
    });
});

describe('no-unsafe-onyx-read references that are not direct calls', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            // Given a direct Onyx.get call in a handler
            // When the rule checks the member access
            // Then it is the callee of the call, so it is not a reference
            `${ONYX_IMPORT} export function submit(key) { return Onyx.get(key); }`,
            // Given a direct Onyx.multiGet call in a handler
            // When the rule checks the member access
            // Then it is the callee of the call, so it is not a reference
            `${ONYX_IMPORT} export function submit() { return Onyx.multiGet([ONYXKEYS.SESSION, ONYXKEYS.ACCOUNT]); }`,
            // Given a direct call written with parentheses around the callee
            // When the parser drops the parentheses
            // Then the member is still the callee, so it is not a reference
            `${ONYX_IMPORT} export function submit(key) { return (Onyx.get)(key); }`,
            // Given an Onyx write method passed around
            // When the rule checks that reference
            // Then only get and multiGet are reads, so nothing is reported
            `${ONYX_IMPORT} const write = Onyx.set; export function submit(key, value) { Onyx.set(key, value); return write; }`,
            // Given a get method on an object that is not the Onyx import
            // When it is passed by reference
            // Then it is not tracked, so nothing is reported
            'const cache = {get: () => undefined}; export const read = cache.get; export const {get} = cache;',
            {
                // Given a write called through a quoted bracket key in a component handler
                // When the rule resolves the key
                // Then merge is a static name and not a read, so nothing is reported
                code: `${ONYX_IMPORT} function Row() { const onPress = () => Onyx['merge'](ONYXKEYS.SESSION, {}); return <View onPress={onPress} />; }`,
                filename: COMPONENT_FILE,
            },
        ],
        invalid: [
            {
                // Given an Onyx method picked by a variable key in a component handler
                // When the rule checks the member access
                // Then the key could name get or multiGet, which neither Onyx rule can see, so the reference is reported
                code: `${ONYX_IMPORT} function Row({method}) { const onPress = () => Onyx[method](ONYXKEYS.SESSION); return <View onPress={onPress} />; }`,
                filename: COMPONENT_FILE,
                errors: BY_REFERENCE_ERRORS,
            },
            {
                // Given the same variable key in src/libs
                // When the rule checks the member access
                // Then only the reference is reported, since the path check sees no resolved read call
                code: `${ONYX_IMPORT} export function load(method) { return Onyx[method](ONYXKEYS.SESSION); }`,
                filename: inRepo('src/libs/Foo.ts'),
                errors: BY_REFERENCE_ERRORS,
            },
            {
                // Given get named by a template literal with no expressions, at module scope
                // When the rule resolves the key
                // Then it is the static name get, so the call is a module-scope read like Onyx.get
                code: `${ONYX_IMPORT} const initialValue = Onyx[\`get\`](ONYXKEYS.SESSION);`,
                errors: MODULE_SCOPE_ERRORS,
            },
            {
                // Given Onyx.get invoked through Function.prototype.call
                // When the rule checks the member access
                // Then the call site and key are hidden, so the reference is reported, and passing Onyx as `this` is a value use
                code: `${ONYX_IMPORT} export function submit(key) { return Onyx.get.call(Onyx, key); }`,
                errors: [BY_REFERENCE_ERROR, OBJECT_AS_VALUE_ERROR],
            },
            {
                // Given Onyx.multiGet invoked through Function.prototype.call
                // When the rule checks the member access
                // Then the call site and keys are hidden, so the reference is reported, and passing Onyx as `this` is a value use
                code: `${ONYX_IMPORT} export function submit(keys) { return Onyx.multiGet.call(Onyx, keys); }`,
                errors: [BY_REFERENCE_ERROR, OBJECT_AS_VALUE_ERROR],
            },
            {
                // Given Onyx.get bound and then called
                // When the rule checks the member access
                // Then the bound function hides the call, so the reference is reported, and passing Onyx as `this` is a value use
                code: `${ONYX_IMPORT} export function submit(key) { return Onyx.get.bind(Onyx)(key); }`,
                errors: [BY_REFERENCE_ERROR, OBJECT_AS_VALUE_ERROR],
            },
            {
                // Given Onyx.get passed as a map callback
                // When the rule checks the member access
                // Then map calls it out of sight, so the reference is reported
                code: `${ONYX_IMPORT} export function submit(keys) { return Promise.all(keys.map(Onyx.get)); }`,
                errors: BY_REFERENCE_ERRORS,
            },
            {
                // Given Onyx.get called through a sequence expression
                // When the rule checks the member access
                // Then the callee is the sequence, not the member, so the reference is reported
                code: `${ONYX_IMPORT} export function submit(key) { return (0, Onyx.get)(key); }`,
                errors: BY_REFERENCE_ERRORS,
            },
            {
                // Given Onyx.get exported under another name
                // When another file imports and calls that name
                // Then this file is the only place the alias is visible, so the reference is reported here
                code: `${ONYX_IMPORT} export const readOnyx = Onyx.get;`,
                errors: BY_REFERENCE_ERRORS,
            },
            {
                // Given get destructured from Onyx and never called in this file
                // When the rule checks the destructured property
                // Then the property is a reference to the read method and is reported
                code: `${ONYX_IMPORT} const {get} = Onyx; export default get;`,
                errors: BY_REFERENCE_ERRORS,
            },
            {
                // Given Onyx imported under another default name
                // When get is invoked through Function.prototype.call on that name
                // Then the alias is resolved, the reference is reported, and passing O as `this` is a value use
                code: "import O from 'react-native-onyx'; export function submit(key) { return O.get.call(O, key); }",
                errors: [BY_REFERENCE_ERROR, OBJECT_AS_VALUE_ERROR],
            },
            {
                // Given a let alias of Onyx.get that only an event handler calls
                // When the rule checks the alias and the call
                // Then the call is an allowed event read, but the alias declaration is reported
                code: `${ONYX_IMPORT} let read = Onyx.get; function Row() { const onPress = () => read(ONYXKEYS.SESSION); return <View onPress={onPress} />; }`,
                errors: BY_REFERENCE_ERRORS,
            },
            {
                // Given Onyx.get passed by reference in an allowed directory
                // When the rule checks the member access
                // Then the reference is reported, since it hides the key in every file
                code: `${ONYX_IMPORT} export function submit(keys) { return Promise.all(keys.map(Onyx.get)); }`,
                filename: inRepo('src/components/Foo.tsx'),
                errors: BY_REFERENCE_ERRORS,
            },
            {
                // Given Onyx.get passed by reference outside the allowed directories
                // When the rule checks the member access
                // Then the reference is reported before the path check, which only sees direct calls, and passing Onyx as `this` is a value use
                code: `${ONYX_IMPORT} export function submit(key) { return Onyx.get.call(Onyx, key); }`,
                filename: inRepo('src/libs/Foo.ts'),
                errors: [BY_REFERENCE_ERROR, OBJECT_AS_VALUE_ERROR],
            },
        ],
    });

    tsRuleTester.run(ruleModule.name, ruleModule, {
        valid: [
            // Given a direct Onyx.get call with explicit type arguments
            // When the rule checks the member access
            // Then the member is still the callee, so it is not a reference
            `${ONYX_IMPORT} export function submit(key: string) { return Onyx.get<Session>(key); }`,
            // Given a direct Onyx.get call whose callee is cast
            // When the rule unwraps the cast
            // Then the member is still the callee, so it is not a reference
            `${ONYX_IMPORT} export function submit(key: string) { return (Onyx.get as typeof Onyx.get)(key); }`,
        ],
        invalid: [
            {
                // Given Onyx.get cast and stored in a const
                // When the rule unwraps the cast
                // Then the member is not a callee, so the reference is reported
                code: `${ONYX_IMPORT} export const read = Onyx.get as typeof Onyx.get;`,
                errors: BY_REFERENCE_ERRORS,
            },
        ],
    });
});

describe('no-unsafe-onyx-read value uses of the Onyx object', () => {
    const SPREAD_READ = `${ONYX_IMPORT} const api = {...Onyx}; export async function load(reportID) { await api.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`); }`;

    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            // Given the Onyx object exposed on window
            // When the rule checks the assignment
            // Then it is the dev console exposure in src/setup/addUtilsToWindow.ts, so nothing is reported
            `${ONYX_IMPORT} window.Onyx = Onyx;`,
            // Given the Onyx object exposed on globalThis
            // When the rule checks the assignment
            // Then it is the same dev console shape, so nothing is reported
            `${ONYX_IMPORT} globalThis.Onyx = Onyx;`,
            // Given the Onyx object exposed on window through a quoted bracket key
            // When the rule resolves the property
            // Then it is the same Onyx property, so nothing is reported
            `${ONYX_IMPORT} window['Onyx'] = Onyx;`,
            // Given a write called through optional chaining
            // When the rule checks the Onyx reference
            // Then it is a member access rather than a value use, so nothing is reported
            `${ONYX_IMPORT} export function save(key, value) { Onyx?.merge(key, value); }`,
            // Given a parameter that shadows the import
            // When the function returns it
            // Then it is not the Onyx import, so nothing is reported
            `${ONYX_IMPORT} export function identity(Onyx) { return Onyx; }`,
            {
                // Given the spread shape in a test suite
                // When the rule checks the Onyx reference
                // Then suites are exempt from the value-use check, so nothing is reported
                code: SPREAD_READ,
                filename: inRepo('tests/unit/Foo.ts'),
            },
            {
                // Given the spread of __mocks__/react-native-onyx.ts, which builds the Jest mock from the real library
                // When the rule checks the Onyx reference
                // Then module mocks are test infrastructure like suites, so nothing is reported
                code: `${ONYX_IMPORT} const reactNativeOnyxMock = {...Onyx, connectWithoutView: () => 0}; export default reactNativeOnyxMock;`,
                filename: inRepo('__mocks__/react-native-onyx.ts'),
            },
            {
                // Given the spread shape in a Jest setup file
                // When the rule checks the Onyx reference
                // Then jest/ is test infrastructure too, so nothing is reported
                code: SPREAD_READ,
                filename: inRepo('jest/setupAfterEnv.ts'),
            },
            {
                // Given the Onyx object re-exported under another name in a test suite
                // When the rule checks the re-export
                // Then suites are exempt from the value-use check, so nothing is reported
                code: "export {default as Store} from 'react-native-onyx'; export * as OnyxModule from 'react-native-onyx';",
                filename: inRepo('tests/utils/Store.ts'),
            },
        ],
        invalid: [
            {
                // Given the Onyx object spread into a local object in src/libs
                // When a read goes through that copy
                // Then the copy hides the read from both Onyx rules, so the spread is reported
                code: SPREAD_READ,
                filename: inRepo('src/libs/actions/Foo.ts'),
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given the same spread in an allowed directory
                // When the rule checks the Onyx reference
                // Then the value use is reported in every file, so the copy cannot hide a read in render
                code: SPREAD_READ,
                filename: inRepo('src/components/Foo.tsx'),
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given the Onyx object passed to a function
                // When the rule checks the argument
                // Then the callee could read through it out of sight, so it is reported
                code: `${ONYX_IMPORT} register(Onyx);`,
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given a function that returns the Onyx object
                // When the rule checks the return
                // Then every caller could read through it, so it is reported
                code: `${ONYX_IMPORT} export function getOnyx() { return Onyx; }`,
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given the Onyx object as the default export
                // When the rule checks the export
                // Then importers could read through it, so it is reported
                code: `${ONYX_IMPORT} export default Onyx;`,
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given the Onyx object as an array element
                // When the rule checks the array
                // Then the array could carry the object out of sight, so it is reported
                code: `${ONYX_IMPORT} export const libraries = [Onyx];`,
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given the Onyx object as an object property value
                // When the rule checks the property
                // Then the object could carry Onyx out of sight, so it is reported
                code: `${ONYX_IMPORT} export const dependencies = {onyx: Onyx};`,
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given a write method destructured from the Onyx object
                // When the rule checks the destructuring source
                // Then destructuring is a value use, so it is reported even though merge is not a read
                code: `${ONYX_IMPORT} const {merge} = Onyx; export function save(key, value) { merge(key, value); }`,
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given get destructured from the Onyx object
                // When the rule checks the destructuring
                // Then the property is already reported by reference, so the source is not reported a second time
                code: `${ONYX_IMPORT} const {get} = Onyx; export function load(key) { return get(key); }`,
                errors: BY_REFERENCE_ERRORS,
            },
            {
                // Given get destructured next to a rest element that carries multiGet
                // When the rule checks the destructuring
                // Then the rest copy hides the multiGet read, so the source is reported as a value use as well as the get property
                code: `${ONYX_IMPORT} const {get, ...rest} = Onyx; export function load(keys) { return rest.multiGet(keys); }`,
                errors: [BY_REFERENCE_ERROR, OBJECT_AS_VALUE_ERROR],
            },
            {
                // Given the Onyx object assigned to a plain variable rather than a member
                // When the rule checks the assignment for the dev console shape
                // Then the target is not a member of window or globalThis, so it is reported without the check crashing
                code: `${ONYX_IMPORT} let api; api = Onyx;`,
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given the Onyx object assigned to a property of something other than window or globalThis
                // When the rule checks the assignment
                // Then only the dev console globals are exempt, so it is reported
                code: `${ONYX_IMPORT} registry.Onyx = Onyx;`,
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given the Onyx object assigned to another property of window
                // When the rule checks the assignment
                // Then only window.Onyx is declared for the dev console, so it is reported
                code: `${ONYX_IMPORT} window.foo = Onyx;`,
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given the Onyx object assigned to another property of globalThis
                // When the rule checks the assignment
                // Then only globalThis.Onyx is exempt, so it is reported
                code: `${ONYX_IMPORT} globalThis.store = Onyx;`,
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given a read through the default member of a namespace import, at module scope
                // When the rule resolves the callee
                // Then Onyx.default is the Onyx object, so it is a module-scope read
                code: "import * as Onyx from 'react-native-onyx'; const session = Onyx.default.get(ONYXKEYS.SESSION);",
                errors: MODULE_SCOPE_ERRORS,
            },
            {
                // Given the default member of a namespace import aliased and read through in a src/libs handler
                // When the rule resolves the alias
                // Then the read is reported by the path check, and the alias is a member access, not a value use
                code: "import * as Onyx from 'react-native-onyx'; const api = Onyx.default; export function load() { return api.get(ONYXKEYS.SESSION); }",
                filename: inRepo('src/libs/Foo.ts'),
                errors: OUTSIDE_ALLOWED_PATH_ERRORS,
            },
            {
                // Given a namespace import of react-native-onyx
                // When the namespace object is aliased
                // Then it is tracked like the default import, so it is reported
                code: "import * as OnyxModule from 'react-native-onyx'; const api = OnyxModule;",
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given a copy of the Onyx object assigned to window.Onyx
                // When the rule checks the assignment for the dev console shape
                // Then only the object itself on the right-hand side is exempt, so the spread is reported
                code: `${ONYX_IMPORT} window.Onyx = {...Onyx};`,
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given the default export of react-native-onyx re-exported under another name in src/libs
                // When the rule checks the re-export
                // Then importers of Store could read through it out of sight, so it is reported
                code: "export {default as Store} from 'react-native-onyx';",
                filename: inRepo('src/libs/Store.ts'),
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given react-native-onyx re-exported as a namespace in src/libs
                // When the rule checks the re-export
                // Then Store.default is the Onyx object, so it is reported
                code: "export * as Store from 'react-native-onyx';",
                filename: inRepo('src/libs/Store.ts'),
                errors: OBJECT_AS_VALUE_ERRORS,
            },
        ],
    });

    tsRuleTester.run(ruleModule.name, ruleModule, {
        valid: [
            // Given the dev console exposure with a widening cast, as in src/setup/addUtilsToWindow.ts
            // When the rule unwraps the cast
            // Then the assignment target is window, so nothing is reported
            `${ONYX_IMPORT} window.Onyx = Onyx as typeof Onyx & {log: () => void};`,
            // Given the dev console exposure on a cast window, the usual way to add a property TS does not know about
            // When the rule unwraps the cast on the assignment target
            // Then the target is still window, so nothing is reported
            `${ONYX_IMPORT} (window as any).Onyx = Onyx;`,
            // Given the dev console exposure on a non-null window
            // When the rule unwraps the assertion on the assignment target
            // Then the target is still window, so nothing is reported
            `${ONYX_IMPORT} window!.Onyx = Onyx;`,
            // Given the Onyx object in a type query
            // When the rule checks the reference
            // Then a type reads nothing at runtime, so nothing is reported
            `${ONYX_IMPORT} type OnyxApi = typeof Onyx; type Get = typeof Onyx.get;`,
            // Given a type-only import of Onyx re-exported, which typescript-eslint marks as a type and a value reference
            // When the rule checks the import
            // Then there is no runtime object to pass around, so the import is skipped and nothing is reported
            "import type Onyx from 'react-native-onyx'; export {Onyx};",
            {
                // Given a type-only re-export from react-native-onyx in src/libs
                // When the rule checks the re-export
                // Then a type reads nothing at runtime, so nothing is reported
                code: "export type {OnyxEntry} from 'react-native-onyx';",
                filename: inRepo('src/libs/Store.ts'),
            },
            {
                // Given a runtime typeof check on the Onyx object in src/libs
                // When the rule checks the reference
                // Then typeof only inspects the object and hides no read, so nothing is reported
                code: `${ONYX_IMPORT} export function hasOnyx() { if (typeof Onyx === 'object') { return true; } return false; }`,
                filename: inRepo('src/libs/Foo.ts'),
            },
        ],
        invalid: [
            {
                // Given the Onyx object spread through a cast
                // When the rule unwraps the cast
                // Then the spread is still a value use and is reported
                code: `${ONYX_IMPORT} const api = {...(Onyx as typeof Onyx)};`,
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given the Onyx object as the default export
                // When the rule checks the export, which typescript-eslint marks as a type and a value reference
                // Then importers could read through it, so it is reported
                code: `${ONYX_IMPORT} export default Onyx;`,
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given the Onyx object re-exported by name
                // When the rule checks the export specifier
                // Then importers could read through it, so it is reported
                code: `${ONYX_IMPORT} export {Onyx};`,
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given the Onyx object re-exported as the default through a specifier
                // When the rule checks the export specifier
                // Then importers could read through it, so it is reported
                code: `${ONYX_IMPORT} export {Onyx as default};`,
                errors: OBJECT_AS_VALUE_ERRORS,
            },
            {
                // Given the Onyx object assigned to window inside a function argument rather than directly
                // When the rule checks the reference
                // Then only the bare assignment shape is exempt, so it is reported
                code: `${ONYX_IMPORT} Object.assign(window, {Onyx: Onyx as typeof Onyx});`,
                errors: OBJECT_AS_VALUE_ERRORS,
            },
        ],
    });
});
