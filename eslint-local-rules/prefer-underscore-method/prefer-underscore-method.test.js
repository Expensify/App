const RuleTester = require('eslint').RuleTester;
const {rule, message} = require('.');

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
    },
});

ruleTester.run('prefer-underscore-method', rule, {
    valid: [
        {
            code: 'const test = _.includes([], \'derp\');',
        },
        {
            code: 'const test = _.filter([], () => {});',
        },
        {
            code: 'const test = \'test\'.includes(\'test\')',
        },
    ],
    invalid: [
        {
            code: 'const test = [].filter(() => {});',
            errors: [{
                message: message.replace('{{method}}', 'filter'),
            }],
        },
        {
            code: 'const test = [].map(() => {});',
            errors: [{
                message: message.replace('{{method}}', 'map'),
            }],
        },
        {
            code: 'const test = [].reduce(() => {}, {});',
            errors: [{
                message: message.replace('{{method}}', 'reduce'),
            }],
        },
    ],
});
