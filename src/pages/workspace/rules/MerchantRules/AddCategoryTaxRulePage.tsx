import useCategoryRuleCreateBackPath from '@hooks/useCategoryRuleCreateBackPath';
import usePolicy from '@hooks/usePolicy';

import {categoryHasTaxRule} from '@libs/CategoryTaxRulesUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {DYNAMIC_ROUTES, getWorkspaceCategorySettingsRoute} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import MerchantRulePageBase from './MerchantRulePageBase';

type AddCategoryTaxRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_TAX_RULE_NEW>;

function AddCategoryTaxRulePage({route}: AddCategoryTaxRulePageProps) {
    const {policyID, categoryName} = route.params;
    const policy = usePolicy(policyID);
    const categorySettingsBackPath = useCategoryRuleCreateBackPath(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_TAX_NEW.path) ?? getWorkspaceCategorySettingsRoute(policyID, categoryName);

    // A category holds one tax default, so creating one for a category that already has it is really an edit. Opening
    // it as one shows the rate already applied and lets the admin delete it.
    const hasExistingRule = categoryHasTaxRule(policy?.rules?.expenseRules, categoryName);

    return (
        <MerchantRulePageBase
            policyID={policyID}
            editCategoryTaxRuleFor={hasExistingRule ? categoryName : undefined}
            newCategoryTaxRuleFor={hasExistingRule ? undefined : categoryName}
            isCategoryLocked
            categorySettingsBackPath={categorySettingsBackPath}
            testID="AddCategoryTaxRulePage"
        />
    );
}

export default AddCategoryTaxRulePage;
