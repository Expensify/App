import useCategoryRuleCreateBackPath from '@hooks/useCategoryRuleCreateBackPath';
import useOnyx from '@hooks/useOnyx';

import {getCategoryTaxDefaultRule} from '@libs/ExpenseDefaultRuleUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES, getWorkspaceCategorySettingsRoute} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import ExpenseDefaultRulePageBase from './ExpenseDefaultRulePageBase';

type AddCategoryTaxRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_TAX_RULE_NEW>;

function AddCategoryTaxRulePage({route}: AddCategoryTaxRulePageProps) {
    const {policyID, categoryName} = route.params;
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const categorySettingsBackPath = useCategoryRuleCreateBackPath(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_TAX_NEW.path) ?? getWorkspaceCategorySettingsRoute(policyID, categoryName);

    // A category holds one tax default, so creating one for a category that already has it is really an edit. Opening
    // it as one shows the rate already applied and lets the admin delete it.
    const existingRuleID = getCategoryTaxDefaultRule(rules, policyID, categoryName)?.ruleID;

    return (
        <ExpenseDefaultRulePageBase
            policyID={policyID}
            ruleID={existingRuleID}
            initialCategoryToMatch={existingRuleID ? undefined : categoryName}
            isCategoryLocked
            categorySettingsBackPath={categorySettingsBackPath}
            testID="AddCategoryTaxRulePage"
        />
    );
}

export default AddCategoryTaxRulePage;
