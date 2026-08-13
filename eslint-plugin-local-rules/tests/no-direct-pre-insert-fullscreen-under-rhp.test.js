// Cases for the local rule, in the same shape as the upstream eslint-plugin-expensify tests, so
// oxlint-migration/rule-tester replays them through both linters (npm run oxlint-rule-tester).
//
// This rule leans on scope analysis harder than any other local rule: it tracks the import binding
// through sourceCode.getDeclaredVariables and sourceCode.getScope, and keeps the Variable objects in
// a WeakSet. Identity of those objects is exactly what a bridged AST can get wrong, which is why the
// aliasing cases below matter more than the plain one.
import {RuleTester} from 'eslint';

// eslint-disable-next-line import/extensions -- Node resolves this file directly when the oxlint-migration harness imports it, so the extension is required
import {create, meta} from '../no-direct-pre-insert-fullscreen-under-rhp.js';

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
});

const importNavigation = "import Navigation from '@libs/Navigation/Navigation';";

ruleTester.run(
    'no-direct-pre-insert-fullscreen-under-rhp',
    {create, meta},
    {
        valid: [
            // the hook itself, and the module the method lives in, are allowed to call it
            {
                code: `${importNavigation}\nNavigation.preInsertFullscreenUnderRHP(route);`,
                filename: 'src/hooks/usePreMountDestination/index.ts',
            },
            {
                code: `${importNavigation}\nNavigation.preInsertFullscreenUnderRHP(route);`,
                filename: 'src/libs/Navigation/Navigation.ts',
            },
            // a same-named local object is not the import binding
            {code: 'const Navigation = {preInsertFullscreenUnderRHP: () => {}};\nNavigation.preInsertFullscreenUnderRHP(route);'},
            // any other method on the real import
            {code: `${importNavigation}\nNavigation.navigate(route);`},
            // reading the method without calling it
            {code: `${importNavigation}\nconst preInsert = Navigation.preInsertFullscreenUnderRHP;`},
        ],
        invalid: [
            {
                code: `${importNavigation}\nNavigation.preInsertFullscreenUnderRHP(route);`,
                errors: [{messageId: 'useHookInstead'}],
            },
            // computed access with a string literal is the same call
            {
                code: `${importNavigation}\nNavigation['preInsertFullscreenUnderRHP'](route);`,
                errors: [{messageId: 'useHookInstead'}],
            },
            // destructured off the import, then called
            {
                code: `${importNavigation}\nconst {preInsertFullscreenUnderRHP} = Navigation;\npreInsertFullscreenUnderRHP(route);`,
                errors: [{messageId: 'useHookInstead'}],
            },
            // aliased into a variable, then called
            {
                code: `${importNavigation}\nconst preInsert = Navigation.preInsertFullscreenUnderRHP;\npreInsert(route);`,
                errors: [{messageId: 'useHookInstead'}],
            },
            // namespace import of the same module
            {
                code: "import * as Navigation from '@src/libs/Navigation/Navigation';\nNavigation.preInsertFullscreenUnderRHP(route);",
                errors: [{messageId: 'useHookInstead'}],
            },
            // a relative path to the same module, from a file the allowlist does not cover
            {
                code: "import Navigation from '../../libs/Navigation/Navigation';\nNavigation.preInsertFullscreenUnderRHP(route);",
                errors: [{messageId: 'useHookInstead'}],
                filename: 'src/pages/home/ReportScreen.tsx',
            },
        ],
    },
);
