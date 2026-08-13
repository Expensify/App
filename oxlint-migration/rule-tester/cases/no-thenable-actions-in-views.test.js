// The one enabled rule in eslint-plugin-expensify that ships without an upstream test. The rule
// lives in node_modules, which is not committed, so its cases live here instead: buildTree.mjs reads
// this directory alongside the two rule directories, and the rule module is still the one both
// linters load.
//
// Two things the rule branches on, both of which a case has to set up deliberately:
//   - isReactViewFile(context.getFilename()), so every case needs a src/pages or src/components path
//   - path.resolve(importSource).includes('/actions/'), which is case-sensitive and resolves against
//     the working directory, so `@userActions/Report` does not match and a relative path does
import {RuleTester} from 'eslint';

import CONST from '../../../node_modules/eslint-config-expensify/eslint-plugin-expensify/CONST.js';
import * as rule from '../../../node_modules/eslint-config-expensify/eslint-plugin-expensify/no-thenable-actions-in-views.js';

const message = CONST.MESSAGE.NO_THENABLE_ACTIONS_IN_VIEWS;

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
});

const importActions = "import * as Report from '../../libs/actions/Report';";

ruleTester.run('no-thenable-actions-in-views', rule, {
    valid: [
        // same code, but not a view file
        {
            code: `${importActions}\nReport.openReport(reportID).then(callback);`,
            filename: 'src/libs/actions/Report.ts',
        },
        // await instead of .then()
        {
            code: `${importActions}\nawait Report.openReport(reportID);`,
            filename: 'src/pages/home/ReportScreen.tsx',
        },
        // .then() on something that is not an actions module
        {
            code: "import * as Utils from '../../libs/ReportUtils';\nUtils.fetchSomething().then(callback);",
            filename: 'src/pages/home/ReportScreen.tsx',
        },
    ],
    invalid: [
        {
            code: `${importActions}\nReport.openReport(reportID).then(callback);`,
            errors: [{message: message.replace('{{method}}', 'Report.openReport()')}],
            filename: 'src/pages/home/ReportScreen.tsx',
        },
        // components count as views too
        {
            code: `${importActions}\nReport.openReport(reportID).then(callback).catch(handleError);`,
            errors: [{message: message.replace('{{method}}', 'Report.openReport()')}],
            filename: 'src/components/ReportActionItem.tsx',
        },
    ],
});
