import React from 'react';
import RuleTextBase from '@components/Rule/RuleTextBase';
import CONST from '@src/CONST';

function AddMerchantPage() {
    return (
        <RuleTextBase
            fieldID={CONST.EXPENSE_RULES.FIELDS.MERCHANT}
            hintKey="expenseRulesPage.addRule.merchantHint"
            isRequired
            titleKey="common.merchant"
            testID="AddMerchantPage"
            characterLimit={CONST.MERCHANT_NAME_MAX_BYTES}
        />
    );
}

export default AddMerchantPage;
