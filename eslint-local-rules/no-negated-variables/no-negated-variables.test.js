const RuleTester = require('eslint').RuleTester;
const {rule, message} = require('.');

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
    },
});

ruleTester.run('no-negated-variables', rule, {
    valid: [
        {
            code: 'const isValid = true;',
        },
        {
            code: 'function isValidName() {}',
        },
    ],
    invalid: [
        {
            code: 'const isNotValid = true;',
            errors: [{
                message,
            }],
        },
        {
            code: 'function isNotValidName() {}',
            errors: [{
                message,
            }],
        },
    ],
});
