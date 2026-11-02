import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import SCREENS from '@src/SCREENS';

import React from 'react';

import MerchantRulePageBase from './MerchantRulePageBase';

type EditCategoryTaxRulePageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_CATEGORY_TAX_EDIT>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CATEGORY_TAX_RULE_EDIT>;

function EditCategoryTaxRulePage({route}: EditCategoryTaxRulePageProps) {
    return (
        <MerchantRulePageBase
            policyID={route.params.policyID}
            editCategoryTaxRuleFor={route.params.categoryName}
            isCategoryLocked={route.name === SCREENS.WORKSPACE.DYNAMIC_CATEGORY_TAX_RULE_EDIT}
            testID="EditCategoryTaxRulePage"
        />
    );
}

export default EditCategoryTaxRulePage;
