import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {Rule} from 'eslint';

import {Linter, RuleTester} from 'eslint';

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

const localRule: LocalRuleModule = ruleModule;

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

const RENDER_ERRORS = [{messageId: 'noOnyxGetInRender'}];
const MODULE_SCOPE_ERRORS = [{messageId: 'noOnyxReadAtModuleScope'}];

describe('no-unsafe-onyx-read', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            `${ONYX_UTILS_IMPORT} function buildPayload(reportID) { return OnyxUtils.get(ONYXKEYS.SESSION); }`,
            `${ONYX_IMPORT} export function submit() { const draft = Onyx.get(ONYXKEYS.SESSION); return draft; }`,
            `${ONYX_UTILS_IMPORT} export function submit() { const draft = OnyxUtils.get(ONYXKEYS.SESSION); return draft; }`,
            `${ONYX_UTILS_IMPORT} const submit = () => OnyxUtils.get(ONYXKEYS.SESSION);`,
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
            `${ONYX_IMPORT} function Row() { const [v] = useReducer((state, action) => Onyx.get(ONYXKEYS.SESSION), 0); return <View v={v} />; }`,
            `${ONYX_IMPORT} function Row() { const v = useSyncExternalStore((notify) => { Onyx.get(ONYXKEYS.SESSION); return noop; }, snapshot); return <View v={v} />; }`,
            `${ONYX_IMPORT} function Row() { useEffect(() => { use(Onyx.get(ONYXKEYS.SESSION)); }, []); return <View />; }`,
            `${ONYX_IMPORT} function Row() { useLayoutEffect(() => { use(Onyx.get(ONYXKEYS.SESSION)); }, []); return <View />; }`,
            `${ONYX_UTILS_IMPORT} function useThing() { return () => OnyxUtils.get(ONYXKEYS.SESSION); }`,
            `${ONYX_IMPORT} function Row() { const onPress = () => Onyx.get(ONYXKEYS.SESSION).then(setValue); return <View onPress={onPress} />; }`,
            `${ONYX_IMPORT} class Row extends React.Component { componentDidMount() { Onyx.get(ONYXKEYS.SESSION).then(this.setValue); } }`,

            `${ONYX_IMPORT} setTimeout(() => Onyx.get(ONYXKEYS.SESSION), 0);`,
            `${ONYX_IMPORT} ready.then(() => Onyx.get(ONYXKEYS.SESSION));`,
            `${ONYX_IMPORT} new Promise((resolve) => { ready.then(() => resolve(Onyx.get(ONYXKEYS.SESSION))); });`,
            `${ONYX_IMPORT} Onyx.init(config).then(() => Onyx.get(ONYXKEYS.SESSION));`,

            `${ONYX_UTILS_IMPORT} async function f(key) { const {...copy} = await OnyxUtils.get(ONYXKEYS.SESSION); copy.name = 'x'; return copy; }`,
            `${ONYX_UTILS_IMPORT} async function f(keys) { const [, ...rest] = await OnyxUtils.multiGet([ONYXKEYS.SESSION]); rest.push(1); return rest; }`,
            `${ONYX_UTILS_IMPORT} async function f(key) { const {details} = await somethingElse(key); details.name = 'x'; return details; }`,
            `${ONYX_UTILS_IMPORT} async function f(key) { ({...(await OnyxUtils.get(ONYXKEYS.SESSION))}).name = 'x'; }`,
            `${ONYX_UTILS_IMPORT} function f(key) { OnyxUtils.get(ONYXKEYS.SESSION).name = 'x'; }`,

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

            `${ONYX_UTILS_IMPORT} async function f(key) { const report = await OnyxUtils.get(ONYXKEYS.SESSION); const copy = {...report}; copy.name = 'x'; return copy; }`,
            `${ONYX_UTILS_IMPORT} async function f(key) { const report = {...(await OnyxUtils.get(ONYXKEYS.SESSION))}; report.name = 'x'; return report; }`,
            `${ONYX_UTILS_IMPORT} async function f(key) { const report = await OnyxUtils.get(ONYXKEYS.SESSION); return {...report, name: 'x'}; }`,
            `${ONYX_UTILS_IMPORT} async function f(key) { const report = await OnyxUtils.get(ONYXKEYS.SESSION); return report.name; }`,
            `${ONYX_UTILS_IMPORT} async function f(key) { const report = await OnyxUtils.get(ONYXKEYS.SESSION); if (report.name) { return 1; } return 2; }`,

            `${ONYX_UTILS_IMPORT} const {get} = OnyxUtils; function Row() { const onPress = () => get(ONYXKEYS.SESSION); return <View onPress={onPress} />; }`,

            `${ONYX_IMPORT} function submit(policyID) { Onyx.mergeCollection(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, values); return Onyx.get(\`\${ONYXKEYS.COLLECTION.POLICY_TAGS}\${policyID}\`); }`,

            `${ONYX_IMPORT} function submit() { if (shouldWrite) { Onyx.merge(key, value); } else { use(Onyx.get(ONYXKEYS.SESSION)); } }`,
            `${ONYX_IMPORT} function submit(action) { switch (action) { case 'write': Onyx.merge(key, value); break; case 'read': use(Onyx.get(ONYXKEYS.SESSION)); break; } }`,

            'const Onyx = {merge: () => {}, get: () => undefined}; function submit() { Onyx.merge(key, value); return Onyx.get(ONYXKEYS.SESSION); }',
        ],
        invalid: [
            {code: `${ONYX_UTILS_IMPORT} function Row() { const value = OnyxUtils.get(ONYXKEYS.SESSION); return <View value={value} />; }`, errors: RENDER_ERRORS},

            {code: `${ONYX_UTILS_IMPORT} const initialValue = OnyxUtils.get(ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},
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
            {code: `${ONYX_UTILS_IMPORT} function useThing() { return OnyxUtils.get(ONYXKEYS.SESSION); }`, errors: RENDER_ERRORS},
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

            {code: `${ONYX_IMPORT} function Row() { const value = (() => Onyx.get(ONYXKEYS.SESSION))(); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { new Promise(() => Onyx.get(ONYXKEYS.SESSION)); return <View />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { new Promise((resolve) => { resolve(Onyx.get(ONYXKEYS.SESSION)); }); return <View />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const values = ids.map((id) => Onyx.get(ONYXKEYS.SESSION)); return <View values={values} />; }`, errors: RENDER_ERRORS},
            {
                code: `${ONYX_IMPORT} function Row() { const values = ids.filter((id) => Onyx.get(ONYXKEYS.SESSION)).map((id) => id); return <View values={values} />; }`,
                errors: RENDER_ERRORS,
            },

            {code: `${ONYX_IMPORT} function Row() { const value = Onyx['get'](ONYXKEYS.SESSION); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const values = Onyx.multiGet([ONYXKEYS.SESSION]); return <View values={values} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const values = Onyx.tupleGet([ONYXKEYS.SESSION]); return <View values={values} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const allKeys = Onyx.getAllKeys(); return <View allKeys={allKeys} />; }`, errors: RENDER_ERRORS},

            {code: `${ONYX_UTILS_IMPORT} const {get} = OnyxUtils; function Row() { const value = get(ONYXKEYS.SESSION); return <View value={value} />; }`, errors: RENDER_ERRORS},
            {
                code: `${ONYX_UTILS_IMPORT} const {get: readOnyx} = OnyxUtils; function Row() { const value = readOnyx(ONYXKEYS.SESSION); return <View value={value} />; }`,
                errors: RENDER_ERRORS,
            },
            {code: `${ONYX_UTILS_IMPORT} const readOnyx = OnyxUtils.get; function Row() { const value = readOnyx(ONYXKEYS.SESSION); return <View value={value} />; }`, errors: RENDER_ERRORS},

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
            {code: `${ONYX_IMPORT} const values = Onyx.multiGet([ONYXKEYS.SESSION]);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} const values = Onyx.tupleGet([ONYXKEYS.SESSION]);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_IMPORT} const allKeys = Onyx.getAllKeys();`, errors: MODULE_SCOPE_ERRORS},

            {code: `${ONYX_UTILS_IMPORT} const {get} = OnyxUtils; const initialValue = get(ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const {get: readOnyx} = OnyxUtils; const initialValue = readOnyx(ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const readOnyx = OnyxUtils.get; const initialValue = readOnyx(ONYXKEYS.SESSION);`, errors: MODULE_SCOPE_ERRORS},

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

const RESTRICTED_ERRORS = [{messageId: 'noRestrictedOnyxKey'}];

const UNRESOLVABLE_ERRORS = [{messageId: 'noUnresolvableOnyxKey'}];

describe('no-unsafe-onyx-read restricted keys', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.get(ONYXKEYS.SESSION); }`},

            // the internal read hits the raw cache, not the surface useOnyx redirects, so the key ban does not apply to it
            {code: `${ONYX_UTILS_IMPORT} export function submit(reportID) { return OnyxUtils.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`); }`},
            {code: `${ONYX_UTILS_IMPORT} export function submit() { return OnyxUtils.get(ONYXKEYS.PERSONAL_DETAILS_LIST); }`},
            {code: `${ONYX_UTILS_IMPORT} const {get} = OnyxUtils; export function submit() { return get(ONYXKEYS.COLLECTION.REPORT); }`},
            {code: `${ONYX_IMPORT} export function submit(id) { return Onyx.get(\`\${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}\${id}\`); }`},
            {code: `${ONYX_IMPORT} export function submit() { const key = ONYXKEYS.SESSION; return Onyx.get(ONYXKEYS.SESSION); }`},
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.getAllKeys(); }`},
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.multiGet([ONYXKEYS.SESSION, ONYXKEYS.ACCOUNT]); }`},
        ],
        invalid: [
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.get(ONYXKEYS.COLLECTION.REPORT); }`, errors: RESTRICTED_ERRORS},
            // position is still checked on the internal read; only the key ban is scoped to the public surface
            {code: `${ONYX_UTILS_IMPORT} function Row() { const v = OnyxUtils.get(ONYXKEYS.COLLECTION.REPORT); return <View v={v} />; }`, errors: RENDER_ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const cached = OnyxUtils.get(ONYXKEYS.COLLECTION.REPORT);`, errors: MODULE_SCOPE_ERRORS},
            {
                code: `${ONYX_IMPORT} export function submit(reportID) { return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`); }`,
                errors: RESTRICTED_ERRORS,
            },

            {
                code: `${ONYX_IMPORT} export function submit() { const key = ONYXKEYS.COLLECTION.REPORT; return Onyx.get(key); }`,
                errors: RESTRICTED_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} export function submit(reportID) { const key = \`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`; return Onyx.get(key); }`,
                errors: RESTRICTED_ERRORS,
            },
            {code: `${ONYX_IMPORT} export function submit(key) { return Onyx.get(key); }`, errors: UNRESOLVABLE_ERRORS},
            {
                code: `${ONYX_IMPORT} export function submit() { return Onyx.multiGet([ONYXKEYS.SESSION, ONYXKEYS.COLLECTION.REPORT]); }`,
                errors: RESTRICTED_ERRORS,
            },
            {code: `${ONYX_IMPORT} export function submit(keys) { return Onyx.multiGet(keys); }`, errors: UNRESOLVABLE_ERRORS},
            {code: `${ONYX_IMPORT} export function submit() { let key = ONYXKEYS.SESSION; key = other; return Onyx.get(key); }`, errors: UNRESOLVABLE_ERRORS},
            {code: `${ONYX_IMPORT} export function submit(id) { return Onyx.get(getTravelCardKey(id)); }`, errors: UNRESOLVABLE_ERRORS},
            {
                code: `${ONYX_IMPORT} export function submit(formID) { return Onyx.get(\`\${formID}Draft\`); }`,
                errors: UNRESOLVABLE_ERRORS,
            },
        ],
    });
});

describe('no-unsafe-onyx-read restricted keys', () => {
    const linter = new Linter();

    /**
     * The restriction the rule implements, stated against its source of truth: a key is out of reach when
     * `src/hooks/useOnyx.ts` would have redirected it to a Search snapshot.
     */
    function isSearchSnapshotKey(value: string): boolean {
        return !value.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT) && CONST.SEARCH.SNAPSHOT_ONYX_KEYS.some((prefix) => value.startsWith(prefix));
    }

    function isRecord(value: unknown): value is Record<string, unknown> {
        return typeof value === 'object' && value !== null;
    }

    /** Every string-valued entry of ONYXKEYS, as the access path a call site would write. */
    function collectKeyPaths(node: Record<string, unknown>, prefix: string[] = []): Array<[string, string]> {
        return Object.entries(node).flatMap<[string, string]>(([name, value]) => {
            if (typeof value === 'string') {
                return [[[...prefix, name].join('.'), value]];
            }

            return isRecord(value) ? collectKeyPaths(value, [...prefix, name]) : [];
        });
    }

    function isRejected(keyPath: string): boolean {
        const code = `${ONYX_IMPORT} export function submit() { return Onyx.get(ONYXKEYS.${keyPath}); }`;
        const messages = linter.verify(code, {
            plugins: {localRules: {rules: {[localRule.name]: localRule}}},
            languageOptions: {ecmaVersion: 2022, sourceType: 'module'},
            rules: {[`localRules/${localRule.name}`]: 'error'},
        });

        return messages.some((message) => message.messageId === 'noRestrictedOnyxKey');
    }

    it('rejects exactly the ONYXKEYS entries a Search scope would redirect', () => {
        const keyPaths = collectKeyPaths(ONYXKEYS);
        expect(keyPaths.length).toBeGreaterThan(500);

        const disagreements = keyPaths.filter(([keyPath, value]) => isRejected(keyPath) !== isSearchSnapshotKey(value));

        expect(disagreements).toEqual([]);
    });

    it('covers every Search snapshot prefix', () => {
        const rejectedValues = collectKeyPaths(ONYXKEYS)
            .filter(([keyPath]) => isRejected(keyPath))
            .map(([, value]) => value);

        for (const prefix of CONST.SEARCH.SNAPSHOT_ONYX_KEYS) {
            expect(rejectedValues.some((value) => value.startsWith(prefix))).toBe(true);
        }
    });
});
