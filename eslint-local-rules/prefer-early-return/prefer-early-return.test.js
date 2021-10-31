const RuleTester = require('eslint').RuleTester;
const {rule, message} = require('.');

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
    },
});

ruleTester.run('prefer-early-return', rule, {
    valid: [
        {
            code: `
                function test() {
                    if (someCondition) {
                        return true;
                    }

                    return false;
                }`,
        },

    ],
    invalid: [
        {
            code: `
                function test() {
                    if (someCondition) {
                        return false;
                    }
                }
            `,
            errors: [{
                message,
            }],
        },
    ],
});
