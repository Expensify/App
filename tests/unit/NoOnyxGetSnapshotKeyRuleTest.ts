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

const ruleModule: unknown = require('../../eslint-plugin-local-rules/no-onyx-get-snapshot-key');

if (!isLocalRuleModule(ruleModule)) {
    throw new TypeError('Expected no-onyx-get-snapshot-key to export an ESLint rule module.');
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

const RESTRICTED_ERRORS = [{messageId: 'noRestrictedOnyxKey'}];

const UNRESOLVABLE_ERRORS = [{messageId: 'noUnresolvableOnyxKey'}];

describe('no-onyx-get-snapshot-key restricted keys', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.get(ONYXKEYS.SESSION); }`},

            {code: `${ONYX_IMPORT} export function submit(id) { return Onyx.get(\`\${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}\${id}\`); }`},
            {code: `${ONYX_IMPORT} export function submit() { const key = ONYXKEYS.SESSION; return Onyx.get(ONYXKEYS.SESSION); }`},
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
            {code: `${ONYX_IMPORT} export function submit() { let key = ONYXKEYS.SESSION; key = other; return Onyx.get(key); }`, errors: UNRESOLVABLE_ERRORS},
            {code: `${ONYX_IMPORT} export function submit(id) { return Onyx.get(getTravelCardKey(id)); }`, errors: UNRESOLVABLE_ERRORS},
            {
                code: `${ONYX_IMPORT} export function submit(formID) { return Onyx.get(\`\${formID}Draft\`); }`,
                errors: UNRESOLVABLE_ERRORS,
            },
        ],
    });
});

describe('no-onyx-get-snapshot-key Concierge chat key', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            // The report ID is provably the Concierge report ID, read with Onyx.get or a useOnyx tuple
            {
                code: `${ONYX_IMPORT} export async function submit() { const conciergeReportID = await Onyx.get(ONYXKEYS.CONCIERGE_REPORT_ID); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${conciergeReportID}\`); }`,
            },
            {
                code: `${ONYX_IMPORT} function Row() { const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID); const onPress = async () => Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${getNonEmptyStringOnyxID(conciergeReportID)}\`); return <Button onPress={onPress} />; }`,
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
            // The exemption covers the report collection only
            {
                code: `${ONYX_IMPORT} export async function submit() { const conciergeReportID = await Onyx.get(ONYXKEYS.CONCIERGE_REPORT_ID); return Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT_ACTIONS}\${conciergeReportID}\`); }`,
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
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.get(ONYXKEYS.SESSION as OnyxKey); }`},
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.multiGet([ONYXKEYS.SESSION, ONYXKEYS.ACCOUNT] as const); }`},
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
        ],
    });
});

describe('no-onyx-get-snapshot-key multiGet', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            `${ONYX_IMPORT} export function submit(id) { return Onyx.multiGet([ONYXKEYS.SESSION, \`\${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}\${id}\`]); }`,
            `${ONYX_IMPORT} export function submit() { const keys = [ONYXKEYS.SESSION, ONYXKEYS.ACCOUNT]; return Onyx.multiGet(keys); }`,
            `${ONYX_IMPORT} export function submit() { return Onyx.multiGet([]); }`,
        ],
        invalid: [
            {code: `${ONYX_IMPORT} export function submit() { return Onyx.multiGet([ONYXKEYS.SESSION, ONYXKEYS.COLLECTION.REPORT]); }`, errors: RESTRICTED_ERRORS},
            {
                code: `${ONYX_IMPORT} export function submit(reportID) { return Onyx.multiGet([ONYXKEYS.PERSONAL_DETAILS_LIST, \`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`]); }`,
                errors: [{messageId: 'noRestrictedOnyxKey'}, {messageId: 'noRestrictedOnyxKey'}],
            },
            {code: `${ONYX_IMPORT} export function submit() { const keys = [ONYXKEYS.COLLECTION.REPORT]; return Onyx.multiGet(keys); }`, errors: RESTRICTED_ERRORS},
            {code: `${ONYX_IMPORT} const {multiGet} = Onyx; export function submit() { return multiGet([ONYXKEYS.COLLECTION.REPORT]); }`, errors: RESTRICTED_ERRORS},
            {code: `${ONYX_IMPORT} export function submit(keys) { return Onyx.multiGet(keys); }`, errors: UNRESOLVABLE_ERRORS},
            {code: `${ONYX_IMPORT} export function submit(key) { return Onyx.multiGet([ONYXKEYS.SESSION, key]); }`, errors: UNRESOLVABLE_ERRORS},
            {code: `${ONYX_IMPORT} export function submit(keys) { return Onyx.multiGet([ONYXKEYS.SESSION, ...keys]); }`, errors: UNRESOLVABLE_ERRORS},
            {code: `${ONYX_IMPORT} export function submit(ids) { return Onyx.multiGet(ids.map((id) => \`\${ONYXKEYS.COLLECTION.POLICY_TAGS}\${id}\`)); }`, errors: UNRESOLVABLE_ERRORS},
        ],
    });
});

describe('no-onyx-get-snapshot-key every ONYXKEYS entry', () => {
    const linter = new Linter();

    function isSearchSnapshotKey(value: string): boolean {
        return !value.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT) && CONST.SEARCH.SNAPSHOT_ONYX_KEYS.some((prefix) => value.startsWith(prefix));
    }

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

describe('no-onyx-get-snapshot-key disabled with a reason', () => {
    it('lets a deliberate live read through while no-unsafe-onyx-read still checks its position', () => {
        // Given a handler that replaces a useOnyxWithoutSnapshots read and disables the key rule with a reason
        const positionRule: unknown = require('../../eslint-plugin-local-rules/no-unsafe-onyx-read');
        if (!isLocalRuleModule(positionRule)) {
            throw new TypeError('Expected no-unsafe-onyx-read to export an ESLint rule module.');
        }
        const code = [
            ONYX_IMPORT,
            'function Row({reportID}) {',
            '    // eslint-disable-next-line localRules/no-onyx-get-snapshot-key -- acts on the live report, not the snapshot row',
            `    Onyx.get(\`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`);`,
            '    return null;',
            '}',
        ].join('\n');

        // When both rules lint it
        const messages = new Linter().verify(code, {
            plugins: {localRules: {rules: {[localRule.name]: localRule, [positionRule.name]: positionRule}}},
            languageOptions: {ecmaVersion: 2022, sourceType: 'module'},
            rules: {[`localRules/${localRule.name}`]: 'error', [`localRules/${positionRule.name}`]: 'error'},
        });

        // Then only the render read is reported, since the disable covers the key choice and nothing else
        expect(messages.map((message) => message.messageId)).toEqual(['noOnyxGetInRender']);
    });
});
