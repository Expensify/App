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

// The rule resolves the import source against the working directory and matches `/actions/`
// case-sensitively, so these cases need relative paths: `@userActions/Report` does not match.
const importActions = "import * as Report from '../../libs/actions/Report';";

ruleTester.run('no-thenable-actions-in-views', rule, {
    valid: [
        {
            code: `${importActions}\nReport.openReport(reportID).then(callback);`,
            filename: 'src/libs/actions/Report.ts',
        },
        {
            code: `${importActions}\nawait Report.openReport(reportID);`,
            filename: 'src/pages/home/ReportScreen.tsx',
        },
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
        {
            code: `${importActions}\nReport.openReport(reportID).then(callback).catch(handleError);`,
            errors: [{message: message.replace('{{method}}', 'Report.openReport()')}],
            filename: 'src/components/ReportActionItem.tsx',
        },
    ],
});
