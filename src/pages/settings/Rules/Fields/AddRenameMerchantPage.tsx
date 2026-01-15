import React from 'react';
import RuleTextBase from '@components/Rule/RuleTextBase';
import CONST from '@src/CONST';

function AddRenameMerchantPage() {
    return (
        <RuleTextBase
            fieldID={CONST.EXPENSE_RULES.FIELDS.RENAME_MERCHANT}
            labelKey="common.merchant"
            titleKey="expenseRulesPage.addRule.renameMerchant"
            testID="AddRenameMerchantPage"
            characterLimit={CONST.MERCHANT_NAME_MAX_BYTES}
        />
    );
}

export default AddRenameMerchantPage;
