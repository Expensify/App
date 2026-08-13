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

const ruleModule: unknown = require('../../eslint-plugin-local-rules/no-onyx-get-in-render');

if (!isLocalRuleModule(ruleModule)) {
    throw new TypeError('Expected no-onyx-get-in-render to export an ESLint rule module.');
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
const ERRORS = [{messageId: 'noOnyxGetInRender'}];

describe('no-onyx-get-in-render', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            // Plain module functions are the sanctioned home for an event-time read.
            `${ONYX_IMPORT} function buildPayload(reportID) { return Onyx.get(reportID); }`,
            `${ONYX_UTILS_IMPORT} export function submit() { const draft = OnyxUtils.get(key); return draft; }`,

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

            // Not the library: a local object exposing a get, and the debug shim on window.
            'const Onyx = {get: () => undefined}; function Row() { const value = Onyx.get(key); return <View value={value} />; }',
            'function Row() { return <View onLoad={window.Onyx.get(key)} />; }',

            // Writes and subscriptions are other rules' business.
            `${ONYX_IMPORT} function Row() { Onyx.merge(key, value); return <View />; }`,

            // Module scope runs at import time, not at render time.
            `${ONYX_IMPORT} const initialValue = Onyx.get(key);`,
            `${ONYX_IMPORT} const values = keys.map((key) => Onyx.get(key));`,

            // An aliased read is still deferred when it sits in a handler.
            `${ONYX_UTILS_IMPORT} const {get} = OnyxUtils; function Row() { const onPress = () => get(key); return <View onPress={onPress} />; }`,
        ],
        invalid: [
            // Component and hook bodies.
            {code: `${ONYX_IMPORT} function Row() { const value = Onyx.get(key); return <View value={value} />; }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} const Row = () => { const value = Onyx.get(key); return <View value={value} />; };`, errors: ERRORS},
            {code: `${ONYX_UTILS_IMPORT} function useThing() { return OnyxUtils.get(key); }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} export default function() { const value = Onyx.get(key); return <View value={value} />; }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} const Row = memo(() => { const value = Onyx.get(key); return <View value={value} />; });`, errors: ERRORS},
            {code: `${ONYX_IMPORT} const Row = forwardRef((props, ref) => { const value = Onyx.get(key); return <View ref={ref} value={value} />; });`, errors: ERRORS},

            // JSX, both as a child and as an attribute value.
            {code: `${ONYX_IMPORT} function Row() { return <Text>{Onyx.get(key)}</Text>; }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function Row() { return <View style={Onyx.get(key)} />; }`, errors: ERRORS},

            // useMemo runs during render, unlike useCallback.
            {code: `${ONYX_IMPORT} function Row() { const value = useMemo(() => Onyx.get(key), []); return <View value={value} />; }`, errors: ERRORS},

            // Function boundaries that defer nothing: an IIFE, and a synchronous array callback.
            {code: `${ONYX_IMPORT} function Row() { const value = (() => Onyx.get(key))(); return <View value={value} />; }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const values = ids.map((id) => Onyx.get(id)); return <View values={values} />; }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const values = ids.filter((id) => Onyx.get(id)).map((id) => id); return <View values={values} />; }`, errors: ERRORS},

            // Every synchronous read API, and both member access forms.
            {code: `${ONYX_IMPORT} function Row() { const value = Onyx['get'](key); return <View value={value} />; }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const values = Onyx.multiGet(keys); return <View values={values} />; }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const values = Onyx.tupleGet(keys); return <View values={values} />; }`, errors: ERRORS},
            {code: `${ONYX_IMPORT} function Row() { const allKeys = Onyx.getAllKeys(); return <View allKeys={allKeys} />; }`, errors: ERRORS},

            // Aliased reads, destructured and assigned.
            {code: `${ONYX_UTILS_IMPORT} const {get} = OnyxUtils; function Row() { const value = get(key); return <View value={value} />; }`, errors: ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const {get: readOnyx} = OnyxUtils; function Row() { const value = readOnyx(key); return <View value={value} />; }`, errors: ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const readOnyx = OnyxUtils.get; function Row() { const value = readOnyx(key); return <View value={value} />; }`, errors: ERRORS},

            // Two reads in one render body report twice.
            {
                code: `${ONYX_IMPORT} function Row() { const a = Onyx.get(keyA); const b = Onyx.get(keyB); return <View a={a} b={b} />; }`,
                errors: [{messageId: 'noOnyxGetInRender'}, {messageId: 'noOnyxGetInRender'}],
            },
        ],
    });
});
