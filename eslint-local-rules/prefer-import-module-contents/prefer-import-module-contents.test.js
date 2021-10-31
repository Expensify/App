const RuleTester = require('eslint').RuleTester;
const {rule, message} = require('.');

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
    },
});

ruleTester.run('prefer-import-module-contents', rule, {
    valid: [
        {
            code: 'import * as test from \'./test\';',
        },
        {
            code: 'import test from \'./test\';',
        },
        {
            code: 'import test, {withTest} from \'./test\';',
        },
        {
            code: 'import {test} from \'test\';',
        },
    ],
    invalid: [
        {
            code: 'import {test} from \'./test\';',
            errors: [{
                message,
            }],
        },
        {
            code: 'import {test} from \'../test\';',
            errors: [{
                message,
            }],
        },
        {
            code: 'import {test, anotherTest} from \'./test\';',
            errors: [{
                message,
            }],
        },
    ],
});
