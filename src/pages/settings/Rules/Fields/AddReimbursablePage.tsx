import React from 'react';
import RuleBooleanBasePage from '@components/Rule/RuleBooleanBase';
import CONST from '@src/CONST';

function AddReimbursablePage() {
    return (
        <RuleBooleanBasePage
            fieldID={CONST.EXPENSE_RULES.FIELDS.REIMBURSABLE}
            titleKey="common.reimbursable"
        />
    );
}

export default AddReimbursablePage;
