import useDynamicBackPath from '@hooks/useDynamicBackPath';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React from 'react';

import ExpenseDefaultRulePageBase from './ExpenseDefaultRulePageBase';

type EditCategoryTaxRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_TAX_RULE_EDIT>;

function EditCategoryTaxRulePage({route}: EditCategoryTaxRulePageProps) {
    const {policyID, categoryName, ruleID} = route.params;
    const isOpenedFromCategorySettings = route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORY_TAX_RULE_EDIT;
    const categorySettingsPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_TAX_EDIT.path, isOpenedFromCategorySettings);

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
