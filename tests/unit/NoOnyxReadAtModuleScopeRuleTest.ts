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

const ruleModule: unknown = require('../../eslint-plugin-local-rules/no-onyx-read-at-module-scope');

if (!isLocalRuleModule(ruleModule)) {
    throw new TypeError('Expected no-onyx-read-at-module-scope to export an ESLint rule module.');
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
const ERRORS = [{messageId: 'noOnyxReadAtModuleScope'}];

/**
 * Validation step B5b of ONYX-GET-VALIDATION-PLAN.md.
 *
 * `no-onyx-get-in-render` allows module scope on purpose, because a module body is not a render body. It is
 * not an event-time position either: it runs at import time, which A7a proved is before `Onyx.init()` has
 * hydrated the cache, and A7c showed what that costs when the key has a value only on disk. This rule owns
 * exactly that window, and stops at the boundary of the other rule's brief.
 */
describe('no-onyx-read-at-module-scope', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            // The sanctioned position: inside a function, so it runs when something calls it.
            `${ONYX_IMPORT} function buildPayload(reportID) { return Onyx.get(reportID); }`,
            `${ONYX_IMPORT} export function submit() { const draft = Onyx.get(key); return draft; }`,
            `${ONYX_UTILS_IMPORT} const submit = () => OnyxUtils.get(key);`,
            `${ONYX_IMPORT} export default function handler() { return Onyx.get(key); }`,
            `${ONYX_IMPORT} const handlers = {onPress: () => Onyx.get(key)};`,
            `${ONYX_IMPORT} class Store { read() { return Onyx.get(key); } }`,

            // Deferred at module scope is still deferred: the callback runs on the timer or the promise, not now.
            `${ONYX_IMPORT} setTimeout(() => Onyx.get(key), 0);`,
            `${ONYX_IMPORT} ready.then(() => Onyx.get(key));`,
            `${ONYX_IMPORT} Onyx.init(config).then(() => Onyx.get(key));`,

            // Render positions belong to no-onyx-get-in-render, so this rule stays quiet on them.
            `${ONYX_IMPORT} function Row() { const value = Onyx.get(key); return <View value={value} />; }`,
            `${ONYX_IMPORT} function Row() { return <Text>{Onyx.get(key)}</Text>; }`,

            // Not the library: a local object that happens to expose a get.
            'const Onyx = {get: () => undefined}; const initialValue = Onyx.get(key);',
            'const initialValue = window.Onyx.get(key);',

            // Writes at module scope are a different question, and not this rule's.
            `${ONYX_IMPORT} Onyx.merge(key, value);`,
            `${ONYX_IMPORT} Onyx.init({keys: ONYXKEYS});`,
        ],
        invalid: [
            // The plain case: a value captured at import time.
            {code: `${ONYX_IMPORT} const initialValue = Onyx.get(key);`, errors: ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const initialValue = OnyxUtils.get(key);`, errors: ERRORS},
            {code: `${ONYX_IMPORT} export const session = Onyx.get(ONYXKEYS.SESSION);`, errors: ERRORS},
            {code: `${ONYX_IMPORT} let cached; cached = Onyx.get(key);`, errors: ERRORS},
            {code: `${ONYX_IMPORT} if (shouldPreload) { const value = Onyx.get(key); use(value); }`, errors: ERRORS},

            // Function boundaries that defer nothing, so the read still happens at import time.
            {code: `${ONYX_IMPORT} const initialValue = (() => Onyx.get(key))();`, errors: ERRORS},
            {code: `${ONYX_IMPORT} const values = keys.map((key) => Onyx.get(key));`, errors: ERRORS},
            {code: `${ONYX_IMPORT} const present = keys.filter((key) => Onyx.get(key)).map((key) => key);`, errors: ERRORS},

            // Every synchronous read API, and both member access forms.
            {code: `${ONYX_IMPORT} const initialValue = Onyx['get'](key);`, errors: ERRORS},
            {code: `${ONYX_IMPORT} const values = Onyx.multiGet(keys);`, errors: ERRORS},
            {code: `${ONYX_IMPORT} const values = Onyx.tupleGet(keys);`, errors: ERRORS},
            {code: `${ONYX_IMPORT} const allKeys = Onyx.getAllKeys();`, errors: ERRORS},

            // Aliased reads, destructured and assigned.
            {code: `${ONYX_UTILS_IMPORT} const {get} = OnyxUtils; const initialValue = get(key);`, errors: ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const {get: readOnyx} = OnyxUtils; const initialValue = readOnyx(key);`, errors: ERRORS},
            {code: `${ONYX_UTILS_IMPORT} const readOnyx = OnyxUtils.get; const initialValue = readOnyx(key);`, errors: ERRORS},

            // Two reads at module scope report twice.
            {
                code: `${ONYX_IMPORT} const a = Onyx.get(keyA); const b = Onyx.get(keyB);`,
                errors: [{messageId: 'noOnyxReadAtModuleScope'}, {messageId: 'noOnyxReadAtModuleScope'}],
            },
        ],
    });
});
