// Cases for the local rule, in the same shape as the upstream eslint-plugin-expensify tests, so
// oxlint-migration/rule-tester replays them through both linters (npm run oxlint-rule-tester).
import {RuleTester} from 'eslint';

// eslint-disable-next-line import/extensions -- Node resolves this file directly when the oxlint-migration harness imports it, so the extension is required
import {create, meta} from '../no-useOnyx-dependencies-arg.js';

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
});

ruleTester.run(
    'no-useOnyx-dependencies-arg',
    {create, meta},
    {
        valid: [
            {code: 'const [account] = useOnyx(ONYXKEYS.ACCOUNT);'},
            {code: 'const [account] = useOnyx(ONYXKEYS.ACCOUNT, {selector: selectAccount});'},
            // the rule matches the bare identifier only, so a method call of the same name is untouched
            {code: 'const [account] = Onyx.useOnyx(ONYXKEYS.ACCOUNT, {selector: selectAccount}, [reportID]);'},
            // three arguments, but not useOnyx
            {code: 'const value = useSomethingElse(key, options, [reportID]);'},
        ],
        invalid: [
            {
                code: 'const [account] = useOnyx(ONYXKEYS.ACCOUNT, {selector: selectAccount}, [reportID]);',
                errors: [{messageId: 'noDependenciesArg'}],
            },
            // reported on the third argument even when a fourth follows
            {
                code: 'const [account] = useOnyx(ONYXKEYS.ACCOUNT, {selector: selectAccount}, [reportID], extra);',
                errors: [{messageId: 'noDependenciesArg'}],
            },
            // the dependency array can be any expression, including an identifier
            {
                code: 'const [account] = useOnyx(ONYXKEYS.ACCOUNT, options, dependencies);',
                errors: [{messageId: 'noDependenciesArg'}],
            },
        ],
    },
);
