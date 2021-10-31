const RuleTester = require('eslint').RuleTester;
const {rule, message} = require('.');

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
    },
});

ruleTester.run('no-inline-named-export', rule, {
    valid: [
        {
            code: 'const test = \'derp\'; export {test}',
        },
        {
            code: 'const test = \'derp\'; export default test',
        },
        {
            code: 'export default () => {}',
        },
    ],
    invalid: [
        {
            code: 'export const inlineNamedExport = true;',
            errors: [{
                message,
            }],
        },
        {
            code: 'export function inlineExport() {}',
            errors: [{
                message,
            }],
        },
        {
            code: 'export class Something {}',
            errors: [{
                message,
            }],
        },
    ],
});
