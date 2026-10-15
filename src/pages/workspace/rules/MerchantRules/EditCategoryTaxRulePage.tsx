import useOnyx from '@hooks/useOnyx';

import {getCategoryTaxDefaultRule} from '@libs/ExpenseDefaultRuleUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import React from 'react';

import MerchantRulePageBase from './MerchantRulePageBase';

type EditCategoryTaxRulePageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_CATEGORY_TAX_EDIT>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_TAX_RULE_EDIT>;

function EditCategoryTaxRulePage({route}: EditCategoryTaxRulePageProps) {
    const {policyID, categoryName} = route.params;
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    // Category settings links by category, since a category holds one tax default, so the rule is resolved here.
    const ruleID = getCategoryTaxDefaultRule(rules, policyID, categoryName)?.ruleID;

    return (
        <MerchantRulePageBase
            policyID={policyID}
            ruleID={ruleID}
            initialCategoryToMatch={ruleID ? undefined : categoryName}
            isCategoryLocked={route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORY_TAX_RULE_EDIT}
            testID="EditCategoryTaxRulePage"
        />
    );
}

export default EditCategoryTaxRulePage;
