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
const WRAPPER_IMPORT = "import OnyxUtils from '@libs/OnyxUtils';";

const RENDER_ERRORS = [{messageId: 'noOnyxGetInRender'}];
const MODULE_SCOPE_ERRORS = [{messageId: 'noOnyxReadAtModuleScope'}];
const DIRECT_ERRORS = [{messageId: 'noDirectOnyxGet'}];

const OPTIONS = [{readSurface: '@libs/OnyxUtils'}];

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
            `${ONYX_IMPORT} function Row() { useOnyx(key, {onLoaded: () => Onyx.get(other)}); return <View />; }`,
            `${ONYX_IMPORT} client.configure({selector: () => Onyx.get(key)});`,
            `${ONYX_IMPORT} function setup() { client.configure({selector: () => Onyx.get(key)}); }`,
            `${ONYX_IMPORT} function Row() { const [v] = useReducer((state, action) => Onyx.get(key), 0); return <View v={v} />; }`,
            `${ONYX_IMPORT} function Row() { const v = useSyncExternalStore((notify) => { Onyx.get(key); return noop; }, snapshot); return <View v={v} />; }`,
            `${ONYX_IMPORT} function Row() { useEffect(() => { use(Onyx.get(key)); }, []); return <View />; }`,
            `${ONYX_IMPORT} function Row() { useLayoutEffect(() => { use(Onyx.get(key)); }, []); return <View />; }`,
            `${ONYX_UTILS_IMPORT} function useThing() { return () => OnyxUtils.get(key); }`,
            `${ONYX_IMPORT} function Row() { const onPress = () => Onyx.get(key).then(setValue); return <View onPress={onPress} />; }`,
            `${ONYX_IMPORT} class Row extends React.Component { componentDidMount() { Onyx.get(key).then(this.setValue); } }`,

            `${ONYX_IMPORT} setTimeout(() => Onyx.get(key), 0);`,
            `${ONYX_IMPORT} ready.then(() => Onyx.get(key));`,
            `${ONYX_IMPORT} new Promise((resolve) => { ready.then(() => resolve(Onyx.get(key))); });`,
            `${ONYX_IMPORT} Onyx.init(config).then(() => Onyx.get(key));`,

            `${WRAPPER_IMPORT} async function f(key) { const {...copy} = await OnyxUtils.get(key); copy.name = 'x'; return copy; }`,
            `${WRAPPER_IMPORT} async function f(keys) { const [, ...rest] = await OnyxUtils.multiGet(keys); rest.push(1); return rest; }`,
            `${WRAPPER_IMPORT} async function f(key) { const {details} = await somethingElse(key); details.name = 'x'; return details; }`,
            `${WRAPPER_IMPORT} async function f(key) { ({...(await OnyxUtils.get(key))}).name = 'x'; }`,
            `${WRAPPER_IMPORT} function f(key) { OnyxUtils.get(key).name = 'x'; }`,

            `${ONYX_IMPORT} const api = window.somethingElse; function Row() { const value = api.get(key); return <View value={value} />; }`,
            `${ONYX_IMPORT} function f(key) { const pending = Onyx.get(key); pending.name = 'x'; return pending; }`,
            `${ONYX_IMPORT} function f(key) { const pending = Onyx.get(key); pending.push(1); return pending; }`,

            'const Onyx = {get: () => undefined}; const initialValue = Onyx.get(key);',
            'const Onyx = {get: () => undefined}; function Row() { const value = Onyx.get(key); return <View value={value} />; }',
            'const initialValue = window.Onyx.get(key);',
            'function Row() { return <View onLoad={window.Onyx.get(key)} />; }',

            `${ONYX_IMPORT} Onyx.init({keys: ONYXKEYS});`,
            `${ONYX_IMPORT} function Row() { Onyx.merge(key, value); return <View />; }`,
            `${ONYX_IMPORT} function submit() { return Onyx.get(key); }`,

            `${WRAPPER_IMPORT} async function f(key) { const report = await OnyxUtils.get(key); const copy = {...report}; copy.name = 'x'; return copy; }`,
            `${WRAPPER_IMPORT} async function f(key) { const report = {...(await OnyxUtils.get(key))}; report.name = 'x'; return report; }`,
            `${WRAPPER_IMPORT} async function f(key) { const report = await OnyxUtils.get(key); return {...report, name: 'x'}; }`,
            `${WRAPPER_IMPORT} async function f(key) { const report = await OnyxUtils.get(key); return report.name; }`,
            `${WRAPPER_IMPORT} async function f(key) { const report = await OnyxUtils.get(key); if (report.name) { return 1; } return 2; }`,

            `${ONYX_UTILS_IMPORT} const {get} = OnyxUtils; function Row() { const onPress = () => get(key); return <View onPress={onPress} />; }`,

            `${ONYX_IMPORT} function submit(reportID) { Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, values); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`); }`,

            `${ONYX_IMPORT} function submit() { if (shouldWrite) { Onyx.merge(key, value); } else { use(Onyx.get(key)); } }`,
            `${ONYX_IMPORT} function submit(action) { switch (action) { case 'write': Onyx.merge(key, value); break; case 'read': use(Onyx.get(key)); break; } }`,

            'const Onyx = {merge: () => {}, get: () => undefined}; function submit() { Onyx.merge(key, value); return Onyx.get(key); }',
        ],
        invalid: [
            {code: `${WRAPPER_IMPORT} function Row() { const value = OnyxUtils.get(key); return <View value={value} />; }`, errors: RENDER_ERRORS},

            {code: `${ONYX_IMPORT} export async function submit() { return Onyx.get(key); }`, options: OPTIONS, errors: DIRECT_ERRORS},
            {code: `${ONYX_IMPORT} const {get} = Onyx; export async function submit() { return get(key); }`, options: OPTIONS, errors: DIRECT_ERRORS},
            {code: `${ONYX_IMPORT} const read = Onyx.get; export async function submit() { return read(key); }`, options: OPTIONS, errors: DIRECT_ERRORS},
            {code: `${ONYX_IMPORT} const Library = Onyx; const read = Library.get; export async function submit() { return read(key); }`, options: OPTIONS, errors: DIRECT_ERRORS},

            {code: `${WRAPPER_IMPORT} const initialValue = OnyxUtils.get(key);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} new Promise((resolve) => { resolve(Onyx.get(key)); });`, errors: MODULE_SCOPE_ERRORS},

            {code: `${ONYX_IMPORT} function Row() { const value = use(Onyx.get(key)); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { Onyx.get(key).then(setValue); return <View />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function useReportName() { return use(Onyx.get(key)); }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const value = React.use(Onyx.get(key)); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const promise = Onyx.get(key); return <View value={use(promise)} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} async function Row() { const value = await Onyx.get(key); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = forwardRef((props, ref) => { Onyx.get(key).then(setValue); return <View ref={ref} />; });`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} class Row extends React.Component { render() { Onyx.get(key).then(this.setValue); return <View />; } }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function useReportName() { Onyx.get(key).then(setState); }`, errors: RENDER_ERRORS},

            {code: `${ONYX_IMPORT} function Row() { const value = Onyx.get(key); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = () => { const value = Onyx.get(key); return <View value={value} />; };`, errors: RENDER_ERRORS},
            {code: `${ONYX_UTILS_IMPORT} function useThing() { return OnyxUtils.get(key); }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const useReportName = () => Onyx.get(key);`, errors: RENDER_ERRORS},

            {code: `${ONYX_IMPORT} export default function() { const value = Onyx.get(key); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = memo(() => { const value = Onyx.get(key); return <View value={value} />; });`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = memo(function () { const value = Onyx.get(key); return <View value={value} />; });`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const Row = forwardRef((props, ref) => { const value = Onyx.get(key); return <View ref={ref} value={value} />; });`, errors: RENDER_ERRORS},

            {code: `${ONYX_IMPORT} function Row() { return <Text>{Onyx.get(key)}</Text>; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { return <View style={Onyx.get(key)} />; }`, errors: RENDER_ERRORS},

            {
                code: `${ONYX_IMPORT} function Row() { const value = useSyncExternalStore(subscribe, () => Onyx.get(key)); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} function Row() { const value = useSyncExternalStore(subscribe, snapshot, () => Onyx.get(key)); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },

            {code: `${ONYX_IMPORT} function Row() { const value = useMemo(() => Onyx.get(key), []); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const value = React.useMemo(() => Onyx.get(key), []); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const [value] = useState(() => Onyx.get(key)); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const [value] = useReducer(reducer, key, (k) => Onyx.get(k)); return <View value={value} />; }`, errors: RENDER_ERRORS},

            {
                code: `${ONYX_IMPORT} function Row() { const [value] = useOnyx(key, {selector: (data) => Onyx.get(other)}); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} function useThing() { return useOnyx(key, {selector: (data) => { const extra = Onyx.get(other); return {...data, extra}; }}); }`,
                errors: RENDER_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} function Row() { const p = usePolicy(id, {selector: (data) => Onyx.get(other)}); return <View p={p} />; }`,
                errors: RENDER_ERRORS,
            },

            {code: `${ONYX_IMPORT} function Row() { const value = (() => Onyx.get(key))(); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { new Promise(() => Onyx.get(key)); return <View />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { new Promise((resolve) => { resolve(Onyx.get(key)); }); return <View />; }`, errors: RENDER_ERRORS},
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

            {code: `${ONYX_IMPORT} function row() { const el = <View a={Onyx.get(key)} />; return el; }`, errors: RENDER_ERRORS},

            {code: `${ONYX_IMPORT} const initialValue = Onyx.get(key);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const initialValue = OnyxUtils.get(key);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} export const session = Onyx.get(ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} let cached; cached = Onyx.get(key);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} if (shouldPreload) { const value = Onyx.get(key); use(value); }`, errors: MODULE_SCOPE_ERRORS},

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

            {code: `${ONYX_IMPORT} const el = <View a={Onyx.get(key)} />;`, errors: MODULE_SCOPE_ERRORS},

            {code: `${ONYX_IMPORT} Onyx.merge(key, value); const restored = Onyx.get(key);`, errors: MODULE_SCOPE_ERRORS},

            {code: `${ONYX_IMPORT} const api = Onyx; function Row() { const value = api.get(key); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} const api = Onyx; const alias = api; function Row() { return <View value={alias.get(key)} />; }`, errors: RENDER_ERRORS},

            {code: `${ONYX_IMPORT} function Row() { Onyx.merge(key, value); const a = Onyx.get(key); return <View a={a} />; }`, errors: RENDER_ERRORS},
        ],
    });
});
