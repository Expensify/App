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
            `${ONYX_IMPORT} let read = Onyx.get; function Row() { const onPress = () => read(ONYXKEYS.SESSION); return <View onPress={onPress} />; }`,
            // A lowercase name with no JSX is a plain function
            `${ONYX_IMPORT} function username() { return Onyx.get(ONYXKEYS.SESSION); }`,
            // A function returned from a factory is a value; only the call site decides
            `${ONYX_IMPORT} function Row() { const makeHandler = () => () => Onyx.get(ONYXKEYS.SESSION); useEffect(() => { emitter.on('change', makeHandler()); }, []); return <View />; }`,
            // Calling the Onyx object itself is not a read
            `${ONYX_IMPORT} const api = Onyx; function Row() { const value = api(ONYXKEYS.SESSION); return <View value={value} />; }`,
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
            // A helper with JSX behind a conditional is a render body
            {code: `${ONYX_IMPORT} function row(v) { const value = use(Onyx.get(ONYXKEYS.SESSION)); return v ? <Row value={value} /> : null; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const row = (v) => (v && <Row value={use(Onyx.get(ONYXKEYS.SESSION))} />);`, errors: RENDER_ERRORS},
            // A hook defined as an object method is still a hook
            {code: `${ONYX_IMPORT} const hooks = {useSession() { return Onyx.get(ONYXKEYS.SESSION); }};`, errors: RENDER_ERRORS},
            // A selector in a const-bound options object reaches the hook the same way
            {
                code: `${ONYX_IMPORT} function Row() { const options = {selector: (data) => Onyx.get(ONYXKEYS.ACCOUNT)}; const [value] = useOnyx(key, options); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            // Aliases resolve by binding, not by source order, and a let alias still counts as a possible read
            {code: `${ONYX_IMPORT} function Row() { const value = read(ONYXKEYS.SESSION); return <View value={value} />; } const read = Onyx.get;`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const value = api.get(ONYXKEYS.SESSION); return <View value={value} />; } const api = Onyx;`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} let read = Onyx.get; function Row() { const value = read(ONYXKEYS.SESSION); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const value = read(ONYXKEYS.SESSION); return <View value={value} />; } const {get: read} = Onyx;`, errors: RENDER_ERRORS},
            {code: `import * as Onyx from 'react-native-onyx'; const initialValue = Onyx.get(ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},
            // An alias of an alias is still a read
            {
                code: `${ONYX_IMPORT} const read = Onyx.get; const read2 = read; function Row() { const value = read2(ONYXKEYS.SESSION); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            // The object and read-method questions are cached separately
            {
                code: `${ONYX_IMPORT} const {get: read} = Onyx; function Row() { read.get(ONYXKEYS.SESSION); const value = read(ONYXKEYS.SESSION); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
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

            {code: `${ONYX_IMPORT} const {get} = Onyx; function Row() { const value = get(ONYXKEYS.SESSION); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {
                code: `${ONYX_IMPORT} const {get: readOnyx} = Onyx; function Row() { const value = readOnyx(ONYXKEYS.SESSION); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {code: `${ONYX_IMPORT} const readOnyx = Onyx.get; function Row() { const value = readOnyx(ONYXKEYS.SESSION); return <View value={value} />; }`, errors: RENDER_ERRORS},

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

            {code: `${ONYX_IMPORT} const {get} = Onyx; const initialValue = get(ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} const {get: readOnyx} = Onyx; const initialValue = readOnyx(ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} const readOnyx = Onyx.get; const initialValue = readOnyx(ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},

            {
                code: `${ONYX_IMPORT} const a = Onyx.get(ONYXKEYS.SESSION); const b = Onyx.get(ONYXKEYS.ACCOUNT);`,
                errors: [{messageId: 'noOnyxReadAtModuleScope'}, {messageId: 'noOnyxReadAtModuleScope'}],
            },

            {code: `${ONYX_IMPORT} const el = <View a={Onyx.get(ONYXKEYS.SESSION)} />;`, errors: MODULE_SCOPE_ERRORS},

            {code: `${ONYX_IMPORT} Onyx.merge(key, value); const restored = Onyx.get(ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},

            {code: `${ONYX_IMPORT} const api = Onyx; function Row() { const value = api.get(ONYXKEYS.SESSION); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const api = Onyx; const alias = api; function Row() { return <View value={alias.get(ONYXKEYS.SESSION)} />; }`, errors: RENDER_ERRORS},

            {code: `${ONYX_IMPORT} function Row() { Onyx.merge(key, value); const a = Onyx.get(ONYXKEYS.SESSION); return <View a={a} />; }`, errors: RENDER_ERRORS},
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
            {code: `${ONYX_IMPORT} const api = Onyx as typeof Onyx; function Row() { const value = api.get(ONYXKEYS.SESSION); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {
                code: `${ONYX_IMPORT} function Row() { const options = {selector: (data: unknown) => Onyx.get(ONYXKEYS.ACCOUNT)} as const; const [value] = useOnyx(key, options); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {code: `${ONYX_IMPORT} const initialValue = Onyx.get(ONYXKEYS.SESSION as OnyxKey);`, errors: MODULE_SCOPE_ERRORS},
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
            // An alias of the handler is followed
            {
                code: `${ONYX_IMPORT} function Row() { const load = () => Onyx.get(ONYXKEYS.SESSION); const run = load; useEffect(() => { run(); }, []); return <View />; }`,
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
            {code: `${ONYX_IMPORT} export async function submit() { return Onyx.get(ONYXKEYS.SESSION); }`, filename: inRepo('src/components/Foo.tsx')},
            {code: `${ONYX_IMPORT} export async function submit() { return Onyx.get(ONYXKEYS.SESSION); }`, filename: inRepo('src/pages/Foo.tsx')},
            {code: `${ONYX_IMPORT} export async function submit() { return Onyx.get(ONYXKEYS.SESSION); }`, filename: inRepo('src/hooks/useFoo.ts')},
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
                errors: OUTSIDE_ALLOWED_PATH_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} export async function submit() { return Onyx.get(ONYXKEYS.COLLECTION.REPORT); }`,
                filename: inRepo('src/libs/Foo.ts'),
                errors: OUTSIDE_ALLOWED_PATH_ERRORS,
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

            {code: `${ONYX_IMPORT} const {multiGet} = Onyx; const initialValues = multiGet([ONYXKEYS.SESSION]);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} const readMany = Onyx.multiGet; function Row() { const values = readMany([ONYXKEYS.SESSION]); return <View values={values} />; }`, errors: RENDER_ERRORS},
        ],
    });
});
