const RuleTester = require('eslint').RuleTester;
const {rule, message} = require('.');

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
    },
});

ruleTester.run('no-useless-compose', rule, {
    valid: [
        {
            code: 'export default compose(withLocalize, withWindowDimensions);',
        },
    ],
    invalid: [
        {
            code: 'export default compose(withLocalize);',
            errors: [{
                message,
            }],
        },
    ],
});
