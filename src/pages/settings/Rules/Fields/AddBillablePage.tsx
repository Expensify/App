import React from 'react';
import RuleBooleanBasePage from '@components/Rule/RuleBooleanBase';
import CONST from '@src/CONST';

function AddBillablePage() {
    return (
        <RuleBooleanBasePage
            fieldID={CONST.EXPENSE_RULES.FIELDS.BILLABLE}
            titleKey="common.billable"
        />
    );
}

export default AddBillablePage;
