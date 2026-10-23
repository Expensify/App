import type {Rule} from 'eslint';

import {RuleTester} from 'eslint';
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

const ruleModule: unknown = require('../../eslint-plugin-local-rules/no-onyx-loading-status');

if (!isLocalRuleModule(ruleModule)) {
    throw new TypeError('Expected no-onyx-loading-status to export an ESLint rule module.');
}

const tsRuleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parser: tsParser,
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
});

describe('no-onyx-loading-status', () => {
    tsRuleTester.run(ruleModule.name, ruleModule, {
        valid: [
            'const [session] = useOnyx(ONYXKEYS.SESSION);',
            'const [session, sessionMetadata] = useOnyx(ONYXKEYS.SESSION); doSomething(sessionMetadata);',
            'const [session, {sourceValue}] = useOnyx(ONYXKEYS.SESSION);',
            "const results = await Promise.allSettled(promises); const isFulfilled = results[0].status === 'fulfilled';",
            "const [first, second] = useSomethingElse(); const isLoaded = second.status === 'loaded';",
            'const response = await fetch(url); const isOk = response.status === 200;',
        ],
        invalid: [
            {
                code: "import isLoadingOnyxValue from './types/utils/isLoadingOnyxValue'; const isLoading = isLoadingOnyxValue(sessionMetadata);",
                errors: [{messageId: 'isLoadingOnyxValueUsage'}],
            },
            {
                code: "import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue'; const a = isLoadingOnyxValue(sessionMetadata); const b = isLoadingOnyxValue(policyMetadata, reportMetadata);",
                errors: [{messageId: 'isLoadingOnyxValueUsage'}, {messageId: 'isLoadingOnyxValueUsage'}],
            },
            {
                code: "import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx'; const [policies, policiesMetadata] = useOnyxWithoutSnapshots(ONYXKEYS.COLLECTION.POLICY); const isLoading = policiesMetadata.status === 'loading';",
                errors: [{messageId: 'statusRead'}],
            },
            {
                code: "import useOnyxValue from '@hooks/useOnyx'; const [session, {status}] = useOnyxValue(ONYXKEYS.SESSION);",
                errors: [{messageId: 'statusRead'}],
            },
            {
                code: "const [session, sessionMetadata] = useOnyx(ONYXKEYS.SESSION); const isLoading = sessionMetadata.status === 'loading';",
                errors: [{messageId: 'statusRead'}],
            },
            {
                code: "const [, cardFeedsResult] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER); const isLoading = cardFeedsResult?.status === 'loading';",
                errors: [{messageId: 'statusRead'}],
            },
            {
                code: "const [session, sessionMetadata] = useOnyx(ONYXKEYS.SESSION); const isLoading = sessionMetadata['status'] === 'loading';",
                errors: [{messageId: 'statusRead'}],
            },
            {
                code: 'const [value, {status}] = useOnyx(onyxKey);',
                errors: [{messageId: 'statusRead'}],
            },
            {
                code: 'const [recentWaypoints, {status: recentWaypointsStatus}] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);',
                errors: [{messageId: 'statusRead'}],
            },
            {
                code: 'const [session, sessionMetadata] = useOnyx(ONYXKEYS.SESSION); const {status} = sessionMetadata;',
                errors: [{messageId: 'statusRead'}],
            },
            {
                // Reported per read, so the seatbelt count is per read too.
                code: 'const [draft, draftMetadata] = useOnyx(ONYXKEYS.DRAFT); useEffect(() => { if (draftMetadata.status !== "loaded") { return; } }, [draft, draftMetadata.status]);',
                errors: [{messageId: 'statusRead'}, {messageId: 'statusRead'}],
            },
        ],
    });
});
