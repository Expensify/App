import React from 'react';
import SpendRuleCategoryBase from '@components/SpendRules/configuration/SpendRuleCategoryBase';
import useOnyx from '@hooks/useOnyx';
import {updateDraftSpendRule} from '@libs/actions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SpendRuleCategory} from '@src/types/form/SpendRuleForm';

function SpendRuleCategoryPage() {
    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);

    const onCategoriesChange = (categories: SpendRuleCategory[]) => {
        updateDraftSpendRule({categories});
    };

    return (
        <SpendRuleCategoryBase
            categories={spendRuleForm?.categories ?? []}
            onCategoriesChange={onCategoriesChange}
        />
    );
}

SpendRuleCategoryPage.displayName = 'SpendRuleCategoryPage';

export default SpendRuleCategoryPage;
