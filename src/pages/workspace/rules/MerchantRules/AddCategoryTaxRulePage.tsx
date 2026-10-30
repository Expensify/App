import useCategoryRuleCreateBackPath from '@hooks/useCategoryRuleCreateBackPath';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {DYNAMIC_ROUTES, getWorkspaceCategorySettingsRoute} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import ExpenseDefaultRulePageBase from './ExpenseDefaultRulePageBase';

type AddCategoryTaxRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_TAX_RULE_NEW>;

function AddCategoryTaxRulePage({route}: AddCategoryTaxRulePageProps) {
    const {policyID, categoryName} = route.params;
    const categorySettingsBackPath = useCategoryRuleCreateBackPath(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_TAX_NEW.path) ?? getWorkspaceCategorySettingsRoute(policyID, categoryName);

    // A category can hold more than one rule, so this creates one the same way the Rules page does rather than
    // opening whichever rule the category already has. Saving one that matches the same things prompts first.
    return (
        <ExpenseDefaultRulePageBase
            policyID={policyID}
            initialCategoryToMatch={categoryName}
            isCategoryLocked
            categorySettingsBackPath={categorySettingsBackPath}
            testID="AddCategoryTaxRulePage"
        />
    );
}

export default AddCategoryTaxRulePage;
