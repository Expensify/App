const RuleTester = require('eslint').RuleTester;
const {rule, message} = require('.');

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
    },
});

const goodExample = `
let testValue;
Onyx.connect('test', (val) => {
    testValue = val;
});
`;

const badExample = `
class MyComponent extends React.Component {
    setValue(value) {
        Onyx.set('testValue', value);
    }

    render() {
        return null;
    }
}
`;

ruleTester.run('no-onyx-in-views', rule, {
    valid: [
        {
            code: goodExample,

            // Mock filename - it's acceptable to use Onyx in an action file, but not component
            filename: './src/libs/actions/Test.js',
        },
    ],
    invalid: [
        {
            code: badExample,
            errors: [{
                message,
            }],
            filename: './src/components/Test.js',
        },
        {
            code: badExample,
            errors: [{
                message,
            }],
            filename: './src/pages/report/Test.js',
        },
    ],
});
