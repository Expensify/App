import React from 'react';
import RuleTextBase from '@components/Rule/RuleTextBase';
import CONST from '@src/CONST';

function AddDescriptionPage() {
    return (
        <RuleTextBase
            fieldID={CONST.EXPENSE_RULES.FIELDS.MERCHANT}
            labelKey="common.description"
            titleKey="expenseRulesPage.addRule.changeDescription"
            testID="AddDescriptionPage"
            characterLimit={CONST.DESCRIPTION_LIMIT}
        />
    );
}

export default AddDescriptionPage;
