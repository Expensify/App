/**
 * @jest-environment node
 */
import isSnapshotCompatibleKey from '@libs/SnapshotUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {Rule} from 'eslint';

import {Linter, RuleTester} from 'eslint';
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

function loadLocalRule(ruleName: string): LocalRuleModule {
    const ruleModule: unknown = require(`../../eslint-plugin-local-rules/${ruleName}`);

    if (!isLocalRuleModule(ruleModule)) {
        throw new TypeError(`Expected ${ruleName} to export an ESLint rule module.`);
    }

    return ruleModule;
}

const ruleModule = loadLocalRule('no-onyx-get-snapshot-key');

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
const USE_ONYX_IMPORT = "import useOnyx from '@hooks/useOnyx';";

const RESTRICTED_ERRORS = [{messageId: 'noRestrictedOnyxKey'}];

const UNRESOLVABLE_ERRORS = [{messageId: 'noUnresolvableOnyxKey'}];

describe('no-onyx-get-snapshot-key restricted keys', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.get(ONYXKEYS.SESSION); }`},

            // POLICY_CATEGORIES is not one of the Search snapshot collections, and a const key resolves to what it holds
            {code: `${ONYX_IMPORT} export function submit(id) { return Onyx.get(\`\${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}\${id}\`); }`},
            {code: `${ONYX_IMPORT} export function submit() { const key = ONYXKEYS.SESSION; return Onyx.get(key); }`},

            // The position rule owns where a read may run, so this rule reports nothing about render or module scope
            {code: `${ONYX_IMPORT} function Row() { const value = Onyx.get(ONYXKEYS.SESSION); return <View value={value} />; }`},
            {code: `${ONYX_IMPORT} const initialValue = Onyx.get(ONYXKEYS.SESSION);`},

            // A same-named object that is not the Onyx import is not tracked
            {code: 'const Onyx = {get: () => undefined}; export function submit() { return Onyx.get(ONYXKEYS.COLLECTION.REPORT); }'},
            {code: `${ONYX_IMPORT} export function submit() { return window.Onyx.get(ONYXKEYS.COLLECTION.REPORT); }`},
        ],
        invalid: [
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.get(ONYXKEYS.COLLECTION.REPORT); }`, errors: RESTRICTED_ERRORS},
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
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.get(ONYXKEYS.COLLECTION); }`, errors: UNRESOLVABLE_ERRORS},
            {code: `${ONYX_IMPORT} export function submit() { let key = ONYXKEYS.SESSION; key = other; return Onyx.get(key); }`, errors: UNRESOLVABLE_ERRORS},
            {code: `${ONYX_IMPORT} export function submit(id) { return Onyx.get(getTravelCardKey(id)); }`, errors: UNRESOLVABLE_ERRORS},
            {
                code: `${ONYX_IMPORT} export function submit(formID) { return Onyx.get(\`\${formID}Draft\`); }`,
                errors: UNRESOLVABLE_ERRORS,
            },
            // A computed member or a static prefix before the ONYXKEYS access cannot be resolved to one key
            {code: `${ONYX_IMPORT} export function submit(name) { return Onyx.get(ONYXKEYS.COLLECTION[name]); }`, errors: UNRESOLVABLE_ERRORS},
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.get(\`report_\${ONYXKEYS.ACCOUNT}\`); }`, errors: UNRESOLVABLE_ERRORS},
            // Aliases resolve by binding, not by source order, and a let alias still counts as a read
            {code: `${ONYX_IMPORT} export function submit() { return read(ONYXKEYS.COLLECTION.REPORT); } const read = Onyx.get;`, errors: RESTRICTED_ERRORS},
            {code: `${ONYX_IMPORT} let read = Onyx.get; export function submit() { return read(ONYXKEYS.COLLECTION.REPORT); }`, errors: RESTRICTED_ERRORS},

            // The key check does not depend on the position of the read
            {code: `${ONYX_IMPORT} function Row() { const value = Onyx.get(ONYXKEYS.COLLECTION.REPORT); return <View value={value} />; }`, errors: RESTRICTED_ERRORS},
            {code: `${ONYX_IMPORT} const initialValue = Onyx.get(ONYXKEYS.PERSONAL_DETAILS_LIST);`, errors: RESTRICTED_ERRORS},

            // A local object named ONYXKEYS is not the real key map, so the key cannot be resolved
            {code: `${ONYX_IMPORT} const ONYXKEYS = {SESSION: 'report_1'}; export function submit() { return Onyx.get(ONYXKEYS.SESSION); }`, errors: UNRESOLVABLE_ERRORS},
            {code: `${ONYX_IMPORT} import ONYXKEYS from '@src/ONYXKEYS'; export function submit() { return Onyx.get(ONYXKEYS.COLLECTION.REPORT); }`, errors: RESTRICTED_ERRORS},
            {code: `${ONYX_IMPORT} import ONYXKEYS from './myKeys'; export function submit() { return Onyx.get(ONYXKEYS.SESSION); }`, errors: UNRESOLVABLE_ERRORS},

            // Aliases of the read methods are tracked the same way
            {code: `${ONYX_IMPORT} const {get} = Onyx; export function submit() { return get(ONYXKEYS.COLLECTION.REPORT); }`, errors: RESTRICTED_ERRORS},
            {code: `${ONYX_IMPORT} const readOnyx = Onyx.get; export function submit() { return readOnyx(ONYXKEYS.COLLECTION.REPORT); }`, errors: RESTRICTED_ERRORS},
            {code: `${ONYX_IMPORT} const api = Onyx; export function submit() { return api.get(ONYXKEYS.COLLECTION.REPORT); }`, errors: RESTRICTED_ERRORS},
        ],
    });
});

describe('no-onyx-get-snapshot-key Concierge chat key', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            // The report ID is a const read of ONYXKEYS.CONCIERGE_REPORT_ID in the same file
            {
                code: `${ONYX_IMPORT} export async function submit() { const conciergeReportID = await Onyx.get(ONYXKEYS.CONCIERGE_REPORT_ID); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); }`,
            },
            {
                code: `${ONYX_IMPORT} ${USE_ONYX_IMPORT} function Row() { const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID); const onPress = async () => Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); return <Button onPress={onPress} />; }`,
            },
            {
                code: `${ONYX_IMPORT} ${USE_ONYX_IMPORT} function Row() { const [conciergeReportID = ''] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true}); const onPress = async () => Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); return <Button onPress={onPress} />; }`,
            },
            {
                code: `${ONYX_IMPORT} export async function submit() { const [session, conciergeReportID] = await Onyx.multiGet([ONYXKEYS.SESSION, ONYXKEYS.CONCIERGE_REPORT_ID]); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); }`,
            },
            // The hook may also come from react-native-onyx under another name, as useOnyx.ts itself imports it
            {
                code: `${ONYX_IMPORT} import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx'; function Row() { const [conciergeReportID] = useOnyxWithoutSnapshots(ONYXKEYS.CONCIERGE_REPORT_ID); const onPress = async () => Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); return <Button onPress={onPress} />; }`,
            },
            // The key may go through a const, and may sit in a multiGet() key list
            {
                code: `${ONYX_IMPORT} export async function submit() { const conciergeReportID = await Onyx.get(ONYXKEYS.CONCIERGE_REPORT_ID); const key = \`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`; return Onyx.get(key); }`,
            },
            {
                code: `${ONYX_IMPORT} export async function submit() { const conciergeReportID = await Onyx.get(ONYXKEYS.CONCIERGE_REPORT_ID); return Onyx.multiGet([ONYXKEYS.SESSION, \`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`]); }`,
            },
        ],
        invalid: [
            // An ID from anywhere else could be a report the Search snapshot shows
            {
                code: `${ONYX_IMPORT} export function submit(conciergeReportID) { return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); }`,
                errors: RESTRICTED_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} export async function submit() { const reportID = await Onyx.get(ONYXKEYS.NVP_ACTIVE_POLICY_ID); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`); }`,
                errors: RESTRICTED_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} export async function submit() { let conciergeReportID = await Onyx.get(ONYXKEYS.CONCIERGE_REPORT_ID); conciergeReportID = other; return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); }`,
                errors: RESTRICTED_ERRORS,
            },
            // Only the tuple slot bound to ONYXKEYS.CONCIERGE_REPORT_ID counts
            {
                code: `${ONYX_IMPORT} export async function submit() { const [conciergeReportID, session] = await Onyx.multiGet([ONYXKEYS.SESSION, ONYXKEYS.CONCIERGE_REPORT_ID]); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); }`,
                errors: RESTRICTED_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} ${USE_ONYX_IMPORT} function Row() { const [, conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID); const onPress = async () => Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); return <Button onPress={onPress} />; }`,
                errors: RESTRICTED_ERRORS,
            },
            // A key list mutated before the read, or an alias of Onyx that can be reassigned, cannot prove where the ID came from
            {
                code: `${ONYX_IMPORT} export async function submit() { const keys = [ONYXKEYS.SESSION, ONYXKEYS.CONCIERGE_REPORT_ID]; keys[1] = ONYXKEYS.NVP_ACTIVE_POLICY_ID; const [session, conciergeReportID] = await Onyx.multiGet(keys); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); }`,
                errors: [{messageId: 'noUnresolvableOnyxKey'}, {messageId: 'noRestrictedOnyxKey'}],
            },
            {
                code: `${ONYX_IMPORT} let read = Onyx.get; read = async () => otherID; export async function submit() { const conciergeReportID = await read(ONYXKEYS.CONCIERGE_REPORT_ID); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); }`,
                errors: RESTRICTED_ERRORS,
            },
            // A spread before the slot shifts the index at runtime
            {
                code: `${ONYX_IMPORT} export async function submit(keys) { const [other, conciergeReportID] = await Onyx.multiGet([...keys, ONYXKEYS.CONCIERGE_REPORT_ID]); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); }`,
                errors: [{messageId: 'noUnresolvableOnyxKey'}, {messageId: 'noRestrictedOnyxKey'}],
            },
            // A default that is not a literal can hand over another report's ID
            {
                code: `${ONYX_IMPORT} ${USE_ONYX_IMPORT} function Row({fallbackID}) { const [conciergeReportID = fallbackID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID); const onPress = async () => Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); return <Button onPress={onPress} />; }`,
                errors: RESTRICTED_ERRORS,
            },
            // Only the useOnyx import counts as the hook, and a selector replaces the tuple value
            {
                code: `${ONYX_IMPORT} function Row() { const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID); const onPress = async () => Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); return <Button onPress={onPress} />; }`,
                errors: RESTRICTED_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} import useOnyx from './useSomethingElse'; function Row() { const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID); const onPress = async () => Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); return <Button onPress={onPress} />; }`,
                errors: RESTRICTED_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} ${USE_ONYX_IMPORT} function Row() { const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {selector: pickOther}); const onPress = async () => Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); return <Button onPress={onPress} />; }`,
                errors: RESTRICTED_ERRORS,
            },
            // The ID in the key resolves in its own scope, not where the read happens
            {
                code: `${ONYX_IMPORT} export function submit(reportID) { const key = \`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`; return async () => { const reportID = await Onyx.get(ONYXKEYS.CONCIERGE_REPORT_ID); return Onyx.get(key); }; }`,
                errors: RESTRICTED_ERRORS,
            },
            // The prefix must be the collection key itself, not a template that starts with it
            {
                code: `${ONYX_IMPORT} export async function submit(reportID) { const conciergeReportID = await Onyx.get(ONYXKEYS.CONCIERGE_REPORT_ID); const prefix = \`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`; return Onyx.get(\`\${prefix}\${conciergeReportID}\`); }`,
                errors: RESTRICTED_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} export async function submit(reportID) { const conciergeReportID = await Onyx.get(ONYXKEYS.CONCIERGE_REPORT_ID); return Onyx.get(\`\${\`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`}\${conciergeReportID}\`); }`,
                errors: RESTRICTED_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} export async function submit(suffix) { const conciergeReportID = await Onyx.get(\`\${ONYXKEYS.CONCIERGE_REPORT_ID}\${suffix}\`); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); }`,
                errors: RESTRICTED_ERRORS,
            },
            // Options that are not a plain object literal could carry a selector
            {
                code: `${ONYX_IMPORT} ${USE_ONYX_IMPORT} function Row({options}) { const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, options); const onPress = async () => Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); return <Button onPress={onPress} />; }`,
                errors: RESTRICTED_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} ${USE_ONYX_IMPORT} function Row({options}) { const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {...options}); const onPress = async () => Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); return <Button onPress={onPress} />; }`,
                errors: RESTRICTED_ERRORS,
            },
            // A third expression in the template makes it another key
            {
                code: `${ONYX_IMPORT} export async function submit(suffix) { const conciergeReportID = await Onyx.get(ONYXKEYS.CONCIERGE_REPORT_ID); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\${suffix}\`); }`,
                errors: RESTRICTED_ERRORS,
            },
            // The exemption covers the report collection only, and only a key made of the prefix and the ID
            {
                code: `${ONYX_IMPORT} export async function submit() { const conciergeReportID = await Onyx.get(ONYXKEYS.CONCIERGE_REPORT_ID); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT_ACTIONS}\${conciergeReportID}\`); }`,
                errors: RESTRICTED_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} export async function submit() { const conciergeReportID = await Onyx.get(ONYXKEYS.CONCIERGE_REPORT_ID); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}_draft\`); }`,
                errors: RESTRICTED_ERRORS,
            },
        ],
    });
});

describe('no-onyx-get-snapshot-key under the TypeScript parser', () => {
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
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.multiGet([ONYXKEYS.SESSION, ONYXKEYS.ACCOUNT] as const); }`},
            {code: `${ONYX_IMPORT} export function submit() { const keys = [ONYXKEYS.SESSION, ONYXKEYS.ACCOUNT] as const; return Onyx.multiGet(keys); }`},
            {code: `${ONYX_IMPORT} export function submit() { const keys = [ONYXKEYS.SESSION, ONYXKEYS.ACCOUNT]; return Onyx.multiGet(keys as OnyxKey[]); }`},
            {code: `${ONYX_IMPORT} export function submit() { const keys = [ONYXKEYS.SESSION, ONYXKEYS.ACCOUNT]; return Onyx.multiGet(keys!); }`},
            {code: `${ONYX_IMPORT} export function submit() { const keys = [ONYXKEYS.SESSION, ONYXKEYS.ACCOUNT]; type Keys = typeof keys; return Onyx.multiGet(keys); }`},
            {
                code: `${ONYX_IMPORT} export async function submit() { const conciergeReportID = (await Onyx.get(ONYXKEYS.CONCIERGE_REPORT_ID)) as string; return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\` as const); }`,
            },
        ],
        invalid: [
            {code: `${ONYX_IMPORT} export function submit(reportID: string) { return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\` as const); }`, errors: RESTRICTED_ERRORS},
            {
                code: `${ONYX_IMPORT} export function submit(reportID: string) { const key = \`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\` as typeof ONYXKEYS.COLLECTION.REPORT; return Onyx.get(key); }`,
                errors: RESTRICTED_ERRORS,
            },
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.get(ONYXKEYS.PERSONAL_DETAILS_LIST as OnyxKey); }`, errors: RESTRICTED_ERRORS},
            {code: `${ONYX_IMPORT} export function submit(key: OnyxKey) { return Onyx.get(key as OnyxKey); }`, errors: UNRESOLVABLE_ERRORS},
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.multiGet([ONYXKEYS.SESSION, ONYXKEYS.COLLECTION.REPORT] as const); }`, errors: RESTRICTED_ERRORS},
            // A cast around the Onyx object does not hide the read
            {code: `${ONYX_IMPORT} export function submit() { return (Onyx as typeof Onyx).get(ONYXKEYS.COLLECTION.REPORT); }`, errors: RESTRICTED_ERRORS},
            {code: `${ONYX_IMPORT} export function submit() { return Onyx!.get(ONYXKEYS.COLLECTION.REPORT); }`, errors: RESTRICTED_ERRORS},
            // An import-equals binding of ONYXKEYS is not the ES import the rule trusts
            {code: `${ONYX_IMPORT} import ONYXKEYS = require('@src/ONYXKEYS'); export function submit() { return Onyx.get(ONYXKEYS.SESSION); }`, errors: UNRESOLVABLE_ERRORS},
        ],
    });
});

describe('no-onyx-get-snapshot-key multiGet', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            `${ONYX_IMPORT} function Row() { const onPress = async () => { const [session, account] = await Onyx.multiGet([ONYXKEYS.SESSION, ONYXKEYS.ACCOUNT]); submit(session, account); }; return <View onPress={onPress} />; }`,
            `${ONYX_IMPORT} export function submit(id) { return Onyx.multiGet([ONYXKEYS.SESSION, \`\${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}\${id}\`]); }`,
            `${ONYX_IMPORT} export function submit() { const keys = [ONYXKEYS.SESSION, ONYXKEYS.ACCOUNT]; return Onyx.multiGet(keys); }`,
            `${ONYX_IMPORT} export function submit() { return Onyx.multiGet([]); }`,

            'const Onyx = {multiGet: () => []}; export function submit() { return Onyx.multiGet([ONYXKEYS.COLLECTION.REPORT]); }',
        ],
        invalid: [
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.multiGet([ONYXKEYS.SESSION, ONYXKEYS.COLLECTION.REPORT]); }`, errors: RESTRICTED_ERRORS},
            {
                code: `${ONYX_IMPORT} export function submit(reportID) { return Onyx.multiGet([ONYXKEYS.PERSONAL_DETAILS_LIST, \`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`]); }`,
                errors: [{messageId: 'noRestrictedOnyxKey'}, {messageId: 'noRestrictedOnyxKey'}],
            },
            {code: `${ONYX_IMPORT} export function submit() { const keys = [ONYXKEYS.COLLECTION.REPORT]; return Onyx.multiGet(keys); }`, errors: RESTRICTED_ERRORS},
            {code: `${ONYX_IMPORT} const {multiGet} = Onyx; export function submit() { return multiGet([ONYXKEYS.COLLECTION.REPORT]); }`, errors: RESTRICTED_ERRORS},
            {code: `${ONYX_IMPORT} const readMany = Onyx.multiGet; export function submit() { return readMany([ONYXKEYS.COLLECTION.REPORT]); }`, errors: RESTRICTED_ERRORS},

            // A const array that is touched anywhere but a call argument may hold other keys by the time it is read
            {
                code: `${ONYX_IMPORT} export function submit() { const keys = [ONYXKEYS.SESSION]; keys.push(ONYXKEYS.COLLECTION.REPORT); return Onyx.multiGet(keys); }`,
                errors: UNRESOLVABLE_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} export function submit() { const keys = [ONYXKEYS.SESSION]; keys[0] = ONYXKEYS.COLLECTION.REPORT; return Onyx.multiGet(keys); }`,
                errors: UNRESOLVABLE_ERRORS,
            },
            {
                code: `${ONYX_IMPORT} export function submit() { const keys = [ONYXKEYS.SESSION]; Object.assign(keys, [ONYXKEYS.COLLECTION.REPORT]); return Onyx.multiGet(keys); }`,
                errors: UNRESOLVABLE_ERRORS,
            },
            {code: `${ONYX_IMPORT} export function submit() { const keys = [ONYXKEYS.SESSION]; addReportKey(keys); return Onyx.multiGet(keys); }`, errors: UNRESOLVABLE_ERRORS},
            // An exported list can be mutated by any importer
            {code: `${ONYX_IMPORT} export const KEYS = [ONYXKEYS.SESSION]; export function submit() { return Onyx.multiGet(KEYS); }`, errors: UNRESOLVABLE_ERRORS},
            // The same list may feed more than one read
            {
                code: `${ONYX_IMPORT} export function submit() { const keys = [ONYXKEYS.COLLECTION.REPORT]; Onyx.multiGet(keys); return Onyx.multiGet(keys); }`,
                errors: [{messageId: 'noRestrictedOnyxKey'}, {messageId: 'noRestrictedOnyxKey'}],
            },

            {code: `${ONYX_IMPORT} export function submit(keys) { return Onyx.multiGet(keys); }`, errors: UNRESOLVABLE_ERRORS},
            {code: `${ONYX_IMPORT} export function submit(key) { return Onyx.multiGet([ONYXKEYS.SESSION, key]); }`, errors: UNRESOLVABLE_ERRORS},
            // Both findings land on the call, so each message names its own key to tell them apart
            {
                code: `${ONYX_IMPORT} export function submit(a, b) { return Onyx.multiGet([ONYXKEYS.SESSION, a, b]); }`,
                errors: [
                    {messageId: 'noUnresolvableOnyxKey', data: {keyText: 'a'}},
                    {messageId: 'noUnresolvableOnyxKey', data: {keyText: 'b'}},
                ],
            },
            {code: `${ONYX_IMPORT} export function submit(keys) { return Onyx.multiGet([ONYXKEYS.SESSION, ...keys]); }`, errors: UNRESOLVABLE_ERRORS},
            {code: `${ONYX_IMPORT} export function submit(ids) { return Onyx.multiGet(ids.map((id) => \`\${ONYXKEYS.COLLECTION.POLICY_TAGS}\${id}\`)); }`, errors: UNRESOLVABLE_ERRORS},
        ],
    });
});

describe('no-onyx-get-snapshot-key every ONYXKEYS entry', () => {
    const linter = new Linter();

    function isRecord(value: unknown): value is Record<string, unknown> {
        return typeof value === 'object' && value !== null;
    }

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
            plugins: {localRules: {rules: {[ruleModule.name]: ruleModule}}},
            languageOptions: {ecmaVersion: 2022, sourceType: 'module'},
            rules: {[`localRules/${ruleModule.name}`]: 'error'},
        });

        return messages.some((message) => message.messageId === 'noRestrictedOnyxKey');
    }

    it('rejects exactly the ONYXKEYS entries a Search scope would redirect', () => {
        // Given every string entry of ONYXKEYS
        const keyPaths = collectKeyPaths(ONYXKEYS);
        expect(keyPaths.length).toBeGreaterThan(500);

        // When each one is read with Onyx.get and compared with what useOnyx would redirect to a snapshot
        const disagreements = keyPaths.filter(([keyPath, value]) => isRejected(keyPath) !== isSnapshotCompatibleKey(value, CONST.SEARCH.SNAPSHOT_ONYX_KEYS));

        // Then the rule's list, the hook's list and the predicate agree on every key, so the rule bans the keys useOnyx redirects and no others
        expect(disagreements).toEqual([]);
    });
});

describe('no-onyx-get-snapshot-key on a multi-line Onyx.multiGet', () => {
    const multiLineRead = [
        ONYX_IMPORT,
        'export async function submit(reportID, transactionID) {',
        '    return Onyx.multiGet([',
        '        ONYXKEYS.SESSION,',
        `        \`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`,`,
        `        \`\${ONYXKEYS.COLLECTION.TRANSACTION}\${transactionID}\`,`,
        '    ]);',
        '}',
    ];

    it('reports every restricted element on the line of the call', () => {
        // Given a multi-line multiGet whose restricted keys sit on lines after the call
        const code = multiLineRead.join('\n');

        // When the key rule lints it
        const messages = new Linter().verify(code, {
            plugins: {localRules: {rules: {[ruleModule.name]: ruleModule}}},
            languageOptions: {ecmaVersion: 2022, sourceType: 'module'},
            rules: {[`localRules/${ruleModule.name}`]: 'error'},
        });

        // Then both keys are reported on the call line, so one directive above the call covers the read
        expect(messages.map((message) => [message.messageId, message.line])).toEqual([
            ['noRestrictedOnyxKey', 3],
            ['noRestrictedOnyxKey', 3],
        ]);
    });

    it('is covered by one reasoned directive above the call', () => {
        // Given the same read with a reasoned disable of the key rule on the line above the call
        const code = [
            ...multiLineRead.slice(0, 2),
            '    // eslint-disable-next-line localRules/no-onyx-get-snapshot-key -- replaces a module-level Onyx.connect used only by handlers, never read a snapshot',
            ...multiLineRead.slice(2),
        ].join('\n');

        // When the key rule lints it with unused directives reported
        const messages = new Linter().verify(code, {
            plugins: {localRules: {rules: {[ruleModule.name]: ruleModule}}},
            languageOptions: {ecmaVersion: 2022, sourceType: 'module'},
            linterOptions: {reportUnusedDisableDirectives: 'error'},
            rules: {[`localRules/${ruleModule.name}`]: 'error'},
        });

        // Then nothing is reported, because the one directive is used and silences every restricted element of the call
        expect(messages).toEqual([]);
    });
});

describe('no-onyx-get-snapshot-key next to no-unsafe-onyx-read', () => {
    it('leaves the position check in place when only the key rule is disabled', () => {
        // Given a render-time read of a snapshot key with a reasoned disable of the key rule only
        const positionRule = loadLocalRule('no-unsafe-onyx-read');
        const code = [
            ONYX_IMPORT,
            'function Row({reportID}) {',
            '    // eslint-disable-next-line localRules/no-onyx-get-snapshot-key -- replaces a module-level Onyx.connect used only by handlers, never read a snapshot',
            `    const report = Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`);`,
            '    return <View report={report} />;',
            '}',
        ].join('\n');

        // When both rules lint it
        const messages = new Linter().verify(code, {
            plugins: {localRules: {rules: {[ruleModule.name]: ruleModule, [positionRule.name]: positionRule}}},
            languageOptions: {ecmaVersion: 2022, sourceType: 'module', parserOptions: {ecmaFeatures: {jsx: true}}},
            rules: {[`localRules/${ruleModule.name}`]: 'error', [`localRules/${positionRule.name}`]: 'error'},
        });

        // Then only the render read is reported, since the disable covers the key choice and nothing else
        expect(messages.map((message) => message.messageId)).toEqual(['noOnyxReadInRender']);
    });
});
