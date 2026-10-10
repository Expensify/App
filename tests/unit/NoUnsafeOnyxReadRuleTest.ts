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

const RENDER_ERRORS = [{messageId: 'noOnyxGetInRender'}];
const MODULE_SCOPE_ERRORS = [{messageId: 'noOnyxReadAtModuleScope'}];
const EFFECT_ERRORS = [{messageId: 'noOnyxReadInEffect'}];
const OUTSIDE_ALLOWED_PATH_ERRORS = [{messageId: 'noOnyxReadOutsideAllowedPath'}];

const REPO_ROOT = path.resolve(__dirname, '../..');

function inRepo(relativePath: string): string {
    return path.join(REPO_ROOT, relativePath);
}

describe('no-unsafe-onyx-read', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            `${ONYX_IMPORT} export function submit() { const draft = Onyx.get(ONYXKEYS.SESSION); return draft; }`,
            `${ONYX_IMPORT} export default function handler() { return Onyx.get(ONYXKEYS.SESSION); }`,
            `${ONYX_IMPORT} const handlers = {onPress: () => Onyx.get(ONYXKEYS.SESSION)};`,
            `${ONYX_IMPORT} class Store { read() { return Onyx.get(ONYXKEYS.SESSION); } }`,

            `${ONYX_IMPORT} function Row() { const onPress = () => Onyx.get(ONYXKEYS.SESSION); return <View onPress={onPress} />; }`,
            `${ONYX_IMPORT} function Row() { return <View onPress={() => Onyx.get(ONYXKEYS.SESSION)} />; }`,
            `${ONYX_IMPORT} function Row() { function onPress() { return Onyx.get(ONYXKEYS.SESSION); } return <View onPress={onPress} />; }`,
            `${ONYX_IMPORT} function Row() { const onPress = async () => { await save(); return Onyx.get(ONYXKEYS.SESSION); }; return <View onPress={onPress} />; }`,

            `${ONYX_IMPORT} function Row() { const onPress = useCallback(() => Onyx.get(ONYXKEYS.SESSION), []); return <View onPress={onPress} />; }`,
            `${ONYX_IMPORT} function Row() { useOnyx(key, {onLoaded: () => Onyx.get(ONYXKEYS.ACCOUNT)}); return <View />; }`,
            `${ONYX_IMPORT} client.configure({selector: () => Onyx.get(ONYXKEYS.SESSION)});`,
            `${ONYX_IMPORT} function setup() { client.configure({selector: () => Onyx.get(ONYXKEYS.SESSION)}); }`,
            `${ONYX_IMPORT} const selector = (data) => Onyx.get(ONYXKEYS.SESSION); client.configure({selector});`,
            `${ONYX_IMPORT} function Row() { const [v] = useReducer((state, action) => Onyx.get(ONYXKEYS.SESSION), 0); return <View v={v} />; }`,
            `${ONYX_IMPORT} function Row() { const v = useSyncExternalStore((notify) => { Onyx.get(ONYXKEYS.SESSION); return noop; }, snapshot); return <View v={v} />; }`,
            `${ONYX_IMPORT} function Row() { const onPress = () => Onyx.get(ONYXKEYS.SESSION).then(setValue); return <View onPress={onPress} />; }`,
            `${ONYX_IMPORT} class Row extends React.Component { componentDidMount() { Onyx.get(ONYXKEYS.SESSION).then(this.setValue); } }`,

            `${ONYX_IMPORT} setTimeout(() => Onyx.get(ONYXKEYS.SESSION), 0);`,
            `${ONYX_IMPORT} ready.then(() => Onyx.get(ONYXKEYS.SESSION));`,
            `${ONYX_IMPORT} new Promise((resolve) => { ready.then(() => resolve(Onyx.get(ONYXKEYS.SESSION))); });`,
            `${ONYX_IMPORT} Onyx.init(config).then(() => Onyx.get(ONYXKEYS.SESSION));`,

            `${ONYX_UTILS_IMPORT} async function f(key) { const {details} = await somethingElse(key); details.name = 'x'; return details; }`,

            `${ONYX_IMPORT} const api = window.somethingElse; function Row() { const value = api.get(ONYXKEYS.SESSION); return <View value={value} />; }`,
            `${ONYX_IMPORT} function f(key) { const pending = Onyx.get(ONYXKEYS.SESSION); pending.name = 'x'; return pending; }`,
            `${ONYX_IMPORT} function f(key) { const pending = Onyx.get(ONYXKEYS.SESSION); pending.push(1); return pending; }`,

            'const Onyx = {get: () => undefined}; const initialValue = Onyx.get(ONYXKEYS.SESSION);',
            'const Onyx = {get: () => undefined}; function Row() { const value = Onyx.get(ONYXKEYS.SESSION); return <View value={value} />; }',
            'const initialValue = window.Onyx.get(ONYXKEYS.SESSION);',
            'function Row() { return <View onLoad={window.Onyx.get(ONYXKEYS.SESSION)} />; }',

            `${ONYX_IMPORT} Onyx.init({keys: ONYXKEYS});`,
            `${ONYX_IMPORT} function Row() { Onyx.merge(key, value); return <View />; }`,
            `${ONYX_IMPORT} function submit() { return Onyx.get(ONYXKEYS.SESSION); }`,

            `${ONYX_IMPORT} function submit(policyID) { Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, values); return Onyx.get(\`\${ONYXKEYS.COLLECTION.POLICY_TAGS}\${policyID}\`); }`,

            `${ONYX_IMPORT} function submit() { if (shouldWrite) { Onyx.merge(key, value); } else { use(Onyx.get(ONYXKEYS.SESSION)); } }`,
            `${ONYX_IMPORT} function submit(action) { switch (action) { case 'write': Onyx.merge(key, value); break; case 'read': use(Onyx.get(ONYXKEYS.SESSION)); break; } }`,

            'const Onyx = {merge: () => {}, get: () => undefined}; function submit() { Onyx.merge(key, value); return Onyx.get(ONYXKEYS.SESSION); }',
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
                errors: [{messageId: 'noOnyxGetInRender'}, {messageId: 'noOnyxGetInRender'}],
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

const SNAPSHOT_READER_IMPORT = "import useSnapshotOnyxGet from '@hooks/useSnapshotOnyxGet';";

describe('no-unsafe-onyx-read useSnapshotOnyxGet reader', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            // Snapshot keys read from handlers
            {
                code: `${SNAPSHOT_READER_IMPORT} function Row({reportID}) { const getOnyx = useSnapshotOnyxGet(); const onPress = async () => getOnyx(\`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`); return <Button onPress={onPress} />; }`,
            },
            // A local copy of the reader and a dependency list keep the reader inside the component
            {
                code: `${SNAPSHOT_READER_IMPORT} function Row() { const getOnyx = useSnapshotOnyxGet(); const read = getOnyx; const onPress = async () => read(ONYXKEYS.PERSONAL_DETAILS_LIST); return <Button onPress={onPress} />; }`,
            },
            {
                code: `${SNAPSHOT_READER_IMPORT} function Row() { const getOnyx = useSnapshotOnyxGet(); const onPress = useCallback(async () => getOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST), [getOnyx]); return <Button onPress={onPress} />; }`,
            },
        ],
        invalid: [
            // Reads during render or in an effect are refused, as for Onyx.get
            {code: `${SNAPSHOT_READER_IMPORT} function Row() { const getOnyx = useSnapshotOnyxGet(); getOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST); return null; }`, errors: RENDER_ERRORS},
            {
                code: `${SNAPSHOT_READER_IMPORT} function Row() { const getOnyx = useSnapshotOnyxGet(); useEffect(() => { getOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST); }, [getOnyx]); return null; }`,
                errors: EFFECT_ERRORS,
            },
            // A copy of the reader is still checked, so a copy cannot be called during render
            {
                code: `${SNAPSHOT_READER_IMPORT} function Row() { const getOnyx = useSnapshotOnyxGet(); const read = getOnyx; read(ONYXKEYS.PERSONAL_DETAILS_LIST); return null; }`,
                errors: RENDER_ERRORS,
            },
            // Calling the hook's result on the spot is a read like any other
            {code: `${SNAPSHOT_READER_IMPORT} function Row() { useSnapshotOnyxGet()(ONYXKEYS.PERSONAL_DETAILS_LIST); return null; }`, errors: RENDER_ERRORS},
            // The reader leaving the component, where the rule cannot follow it
            {code: `${SNAPSHOT_READER_IMPORT} function Row() { const getOnyx = useSnapshotOnyxGet(); return <Child read={getOnyx} />; }`, errors: [{messageId: 'noEscapingSnapshotReader'}]},
            {
                code: `${SNAPSHOT_READER_IMPORT} function Row() { const getOnyx = useSnapshotOnyxGet(); const onPress = () => openReport(getOnyx); return <Button onPress={onPress} />; }`,
                errors: [{messageId: 'noEscapingSnapshotReader'}],
            },
            {code: `${SNAPSHOT_READER_IMPORT} function useReader() { const getOnyx = useSnapshotOnyxGet(); return getOnyx; }`, errors: [{messageId: 'noEscapingSnapshotReader'}]},
            {code: `${SNAPSHOT_READER_IMPORT} function useReader() { const getOnyx = useSnapshotOnyxGet(); return {getOnyx}; }`, errors: [{messageId: 'noEscapingSnapshotReader'}]},
            {code: `${SNAPSHOT_READER_IMPORT} function useReader() { return useSnapshotOnyxGet(); }`, errors: [{messageId: 'noEscapingSnapshotReader'}]},
            {code: `${SNAPSHOT_READER_IMPORT} function Row() { return <Child read={useSnapshotOnyxGet()} />; }`, errors: [{messageId: 'noEscapingSnapshotReader'}]},
        ],
    });
});

describe('no-unsafe-onyx-read under the TypeScript parser', () => {
    tsRuleTester.run(ruleModule.name, ruleModule, {
        valid: [
            {code: `${ONYX_IMPORT} export function submit(id: string) { return Onyx.get(\`\${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}\${id}\` as const); }`},
            {code: `${ONYX_IMPORT} export function submit(id: string) { const key = \`\${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}\${id}\` as const; return Onyx.get(key); }`},
            {
                code: `${ONYX_IMPORT} export function submit(id: string) { const key = \`\${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}\${id}\` as typeof ONYXKEYS.COLLECTION.POLICY_CATEGORIES; return Onyx.get(key); }`,
            },
            {code: `${ONYX_IMPORT} export function submit(id: string) { return Onyx.get(\`\${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}\${id}\` satisfies string); }`},
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.get(ONYXKEYS.SESSION as OnyxKey); }`},
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.get(ONYXKEYS.SESSION!); }`},
            {code: `${ONYX_IMPORT} export function submit(): Promise<unknown> { return Onyx.get(ONYXKEYS.SESSION); }`},
        ],
        invalid: [
            {
                code: `${ONYX_IMPORT} function Row({id}: {id: string}) { const value = Onyx.get(ONYXKEYS.SESSION as OnyxKey); return <View value={value} id={id} />; }`,
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
            {code: `${ONYX_IMPORT} function useSnapshotOnyxGet(key) { Onyx.get(key); }`, filename: inRepo('src/hooks/useSnapshotOnyxGet.ts'), errors: RENDER_ERRORS},
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
