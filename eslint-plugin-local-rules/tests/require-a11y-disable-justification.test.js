// Cases for the local rule, in the same shape as the upstream eslint-plugin-expensify tests, so
// oxlint-probe/rule-tester replays them through both linters (npm run oxlint-rule-tester).
//
// The cases are made of real eslint-disable comments, because that is what the rule reads. Two
// consequences for the replay harness: the ESLint config it uses turns
// linterOptions.reportUnusedDisableDirectives off (an unused directive carries no ruleId, so it
// would surface as a fatal error rather than a finding), and the disabled ids name a plugin neither
// linter has loaded, which both tools ignore.
import {RuleTester} from 'eslint';

// eslint-disable-next-line import/extensions -- Node resolves this file directly when the oxlint-probe harness imports it, so the extension is required
import {create, meta} from '../require-a11y-disable-justification.js';

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parserOptions: {ecmaFeatures: {jsx: true}},
    },
});

const ISSUE = 'https://github.com/Expensify/App/issues/12345';

ruleTester.run(
    'require-a11y-disable-justification',
    {create, meta},
    {
        valid: [
            // a tracking issue link is enough on its own
            {code: `// eslint-disable-next-line react-native-a11y/has-valid-accessibility-descriptors -- ${ISSUE}\nconst element = <View onPress={onPress} />;`},
            // a pull request link on the plugin's own repository also counts
            {
                code: '// eslint-disable-next-line react-native-a11y/has-valid-accessibility-ignores-invalid-hints -- https://github.com/FormidableLabs/eslint-plugin-react-native-a11y/pull/78\nconst element = <View onPress={onPress} />;',
            },
            // prose long enough to say something
            {
                code: '// eslint-disable-next-line react-native-a11y/has-valid-accessibility-descriptors -- decorative wrapper, the child owns the label\nconst element = <View onPress={onPress} />;',
            },
            // block form, rationale spread over two lines
            {
                code: '/* eslint-disable react-native-a11y/has-valid-accessibility-descriptors\n * the row below is announced by its parent list item\n */\nconst element = <View onPress={onPress} />;',
            },
            // a link to some other site is not a tracking issue, but it still passes: the rule strips the
            // directive and the rule id, and what is left is long enough to count as having said
            // something. Measured, not assumed -- this case was written as invalid and the harness
            // corrected it.
            {code: '// eslint-disable-next-line react-native-a11y/has-valid-accessibility-descriptors -- https://example.com/1\nconst element = <View onPress={onPress} />;'},
            // a disable comment for some other plugin is none of this rule's business
            {code: '// eslint-disable-next-line no-console\nconsole.log(1);'},
            // no disable comment at all
            {code: 'const element = <View onPress={onPress} />;'},
        ],
        invalid: [
            // bare disable, nothing said
            {
                code: '// eslint-disable-next-line react-native-a11y/has-valid-accessibility-descriptors\nconst element = <View onPress={onPress} />;',
                errors: [{messageId: 'missingIssueOrRationale'}],
            },
            // too short to be a rationale: the rule strips the directive, the rule id and the dashes,
            // and what is left has to be at least 12 characters
            {
                code: '// eslint-disable-next-line react-native-a11y/has-valid-accessibility-descriptors -- legacy\nconst element = <View onPress={onPress} />;',
                errors: [{messageId: 'missingIssueOrRationale'}],
            },
            // file-level block form, no rationale
            {
                code: '/* eslint-disable react-native-a11y/has-valid-accessibility-ignores-invalid-hints */\nconst element = <View onPress={onPress} />;',
                errors: [{messageId: 'missingIssueOrRationale'}],
            },
            // two unjustified comments in one file, so the rule has to report per comment
            {
                code: '// eslint-disable-next-line react-native-a11y/has-valid-accessibility-descriptors\nconst first = <View onPress={onPress} />;\n// eslint-disable-next-line react-native-a11y/has-valid-accessibility-ignores-invalid-hints\nconst second = <View onPress={onPress} />;',
                errors: [{messageId: 'missingIssueOrRationale'}, {messageId: 'missingIssueOrRationale'}],
            },
        ],
    },
);
