import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';

import {getCategoryExpenseDefaultRule} from '@libs/ExpenseDefaultRuleUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React from 'react';

import ExpenseDefaultRulePageBase from './ExpenseDefaultRulePageBase';

type EditCategoryTaxRulePageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_CATEGORY_TAX_EDIT>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_TAX_RULE_EDIT>;

function EditCategoryTaxRulePage({route}: EditCategoryTaxRulePageProps) {
    const {policyID, categoryName} = route.params;
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const isOpenedFromCategorySettings = route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORY_TAX_RULE_EDIT;
    const categorySettingsPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_TAX_EDIT.path, isOpenedFromCategorySettings);
    // Category settings links by category rather than by rule, so the rule it is pointing at is resolved here.
    const ruleID = getCategoryExpenseDefaultRule(rules, policyID, categoryName)?.ruleID;

    return (
        <ExpenseDefaultRulePageBase
            policyID={policyID}
            ruleID={ruleID}
            initialCategoryToMatch={ruleID ? undefined : categoryName}
            isCategoryLocked={isOpenedFromCategorySettings}
            categorySettingsBackPath={isOpenedFromCategorySettings ? categorySettingsPath : undefined}
            testID="EditCategoryTaxRulePage"
        />
    );
}

export default EditCategoryTaxRulePage;
