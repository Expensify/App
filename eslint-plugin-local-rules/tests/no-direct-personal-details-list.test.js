import {RuleTester} from 'eslint';

// eslint-disable-next-line import/extensions -- Node resolves this file directly when the oxlint-migration harness imports it, so the extension is required
import {create, meta} from '../no-direct-personal-details-list.js';

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
});

// Mirrors tests/unit/NoDirectPersonalDetailsListRuleTest.ts. oxlint-migration/rule-tester harvests
// this file and replays the cases through both tools, so the rule is proven to report on oxlint's
// bridged AST, not just on ESLint's.

ruleTester.run(
    'no-direct-personal-details-list',
    {create, meta},
    {
        valid: [
            'const [personalDetail] = usePersonalDetail(accountID);',
            'const [personalDetails] = usePersonalDetailsByIDs(accountIDs);',
            'const personalDetail = getPersonalDetail(accountID);',
            'type Update = OnyxUpdate<typeof ONYXKEYS.PERSONAL_DETAILS_LIST>;',
            'type Data = Partial<Record<typeof ONYXKEYS.PERSONAL_DETAILS_LIST, PersonalDetailsList>>;',
            'const [metadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_METADATA);',
            'const [list] = useOnyx(ONYXKEYS.COLLECTION.REPORT);',
            'const key = SOME_OTHER_KEYS.PERSONAL_DETAILS_LIST;',
            'const key = ONYXKEYS[PERSONAL_DETAILS_LIST];',
        ],
        invalid: [
            {code: 'const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);', errors: 1},
            {code: 'const [login] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(accountID)});', errors: 1},
            {code: "const [personalDetails] = useOnyx(ONYXKEYS['PERSONAL_DETAILS_LIST']);", errors: 1},
            {code: 'const [personalDetails] = useOnyx(ONYXKEYS[`PERSONAL_DETAILS_LIST`]);', errors: 1},
            {code: 'Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[accountID]: null});', errors: 1},
            {code: 'const update = {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.PERSONAL_DETAILS_LIST, value: personalDetails};', errors: 1},
            {code: 'Onyx.connectWithoutView({key: ONYXKEYS.PERSONAL_DETAILS_LIST, callback: (value) => value});', errors: 1},
            {code: 'const masks = {[ONYXKEYS.PERSONAL_DETAILS_LIST]: {allowList: []}};', errors: 1},
            {code: 'const [all] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST); Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {});', errors: 2},
        ],
    },
);
