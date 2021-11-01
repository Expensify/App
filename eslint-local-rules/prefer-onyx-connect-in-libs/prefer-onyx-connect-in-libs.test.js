const RuleTester = require('eslint').RuleTester;
const {rule, message} = require('.');

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
    },
});

const example = `
Onyx.connect({
    key: ONYXKEYS.KEY_NAME,
    callback: () => {},
});
`;

ruleTester.run('prefer-onyx-connect-in-libs', rule, {
    valid: [
        {
            code: example,

            // Mock filename - it's acceptable to use Onyx.connect() in an action file only
            filename: './src/libs/actions/Test.js',
        },
    ],
    invalid: [
        {
            code: example,
            errors: [{
                message,
            }],
            filename: './src/components/Test.js',
        },
        {
            code: example,
            errors: [{
                message,
            }],
            filename: './src/pages/report/Test.js',
        },
    ],
});
