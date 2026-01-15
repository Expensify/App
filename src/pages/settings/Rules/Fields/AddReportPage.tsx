import React from 'react';
import RuleTextBase from '@components/Rule/RuleTextBase';
import CONST from '@src/CONST';

function AddReportPage() {
    return (
        <RuleTextBase
            fieldID={CONST.EXPENSE_RULES.FIELDS.REPORT}
            labelKey="common.reportName"
            titleKey="expenseRulesPage.addRule.addToReport"
            testID="AddReportPage"
            characterLimit={CONST.REPORT_NAME_LIMIT}
        />
    );
}

export default AddReportPage;
