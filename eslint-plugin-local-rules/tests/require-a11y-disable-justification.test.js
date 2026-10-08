import {RuleTester} from 'eslint';

// eslint-disable-next-line import/extensions -- Node resolves this file directly when the oxlint-migration harness imports it, so the extension is required
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
            {code: `// eslint-disable-next-line react-native-a11y/has-valid-accessibility-descriptors -- ${ISSUE}\nconst element = <View onPress={onPress} />;`},
            {
                code: '// eslint-disable-next-line react-native-a11y/has-valid-accessibility-ignores-invalid-hints -- https://github.com/FormidableLabs/eslint-plugin-react-native-a11y/pull/78\nconst element = <View onPress={onPress} />;',
            },
            {
                code: '// eslint-disable-next-line react-native-a11y/has-valid-accessibility-descriptors -- decorative wrapper, the child owns the label\nconst element = <View onPress={onPress} />;',
            },
            {
                code: '/* eslint-disable react-native-a11y/has-valid-accessibility-descriptors\n * the row below is announced by its parent list item\n */\nconst element = <View onPress={onPress} />;',
            },
            {code: '// eslint-disable-next-line react-native-a11y/has-valid-accessibility-descriptors -- https://example.com/1\nconst element = <View onPress={onPress} />;'},
            {code: '// eslint-disable-next-line no-console\nconsole.log(1);'},
            {code: 'const element = <View onPress={onPress} />;'},
        ],
        invalid: [
            {
                code: '// eslint-disable-next-line react-native-a11y/has-valid-accessibility-descriptors\nconst element = <View onPress={onPress} />;',
                errors: [{messageId: 'missingIssueOrRationale'}],
            },
            {
                code: '// eslint-disable-next-line react-native-a11y/has-valid-accessibility-descriptors -- legacy\nconst element = <View onPress={onPress} />;',
                errors: [{messageId: 'missingIssueOrRationale'}],
            },
            {
                code: '/* eslint-disable react-native-a11y/has-valid-accessibility-ignores-invalid-hints */\nconst element = <View onPress={onPress} />;',
                errors: [{messageId: 'missingIssueOrRationale'}],
            },
            {
                code: '// eslint-disable-next-line react-native-a11y/has-valid-accessibility-descriptors\nconst first = <View onPress={onPress} />;\n// eslint-disable-next-line react-native-a11y/has-valid-accessibility-ignores-invalid-hints\nconst second = <View onPress={onPress} />;',
                errors: [{messageId: 'missingIssueOrRationale'}, {messageId: 'missingIssueOrRationale'}],
            },
        ],
    },
);
