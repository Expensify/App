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
            {
                code: `${importNavigation}\nNavigation.preInsertFullscreenUnderRHP(route);`,
                filename: 'src/hooks/usePreMountDestination/index.ts',
            },
            {
                code: `${importNavigation}\nNavigation.preInsertFullscreenUnderRHP(route);`,
                filename: 'src/libs/Navigation/Navigation.ts',
            },
            {code: 'const Navigation = {preInsertFullscreenUnderRHP: () => {}};\nNavigation.preInsertFullscreenUnderRHP(route);'},
            {code: `${importNavigation}\nNavigation.navigate(route);`},
            {code: `${importNavigation}\nconst preInsert = Navigation.preInsertFullscreenUnderRHP;`},
        ],
        invalid: [
            {
                code: `${importNavigation}\nNavigation.preInsertFullscreenUnderRHP(route);`,
                errors: [{messageId: 'useHookInstead'}],
            },
            {
                code: `${importNavigation}\nNavigation['preInsertFullscreenUnderRHP'](route);`,
                errors: [{messageId: 'useHookInstead'}],
            },
            {
                code: `${importNavigation}\nconst {preInsertFullscreenUnderRHP} = Navigation;\npreInsertFullscreenUnderRHP(route);`,
                errors: [{messageId: 'useHookInstead'}],
            },
            {
                code: `${importNavigation}\nconst preInsert = Navigation.preInsertFullscreenUnderRHP;\npreInsert(route);`,
                errors: [{messageId: 'useHookInstead'}],
            },
            {
                code: "import * as Navigation from '@src/libs/Navigation/Navigation';\nNavigation.preInsertFullscreenUnderRHP(route);",
                errors: [{messageId: 'useHookInstead'}],
            },
            {
                code: "import Navigation from '../../libs/Navigation/Navigation';\nNavigation.preInsertFullscreenUnderRHP(route);",
                errors: [{messageId: 'useHookInstead'}],
                filename: 'src/pages/home/ReportScreen.tsx',
            },
        ],
    },
);
