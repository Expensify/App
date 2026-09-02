import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';

import React from 'react';

import MerchantRulePageBase from './MerchantRulePageBase';

type EditCategoryTaxRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_CATEGORY_TAX_EDIT>;

function EditCategoryTaxRulePage({route}: EditCategoryTaxRulePageProps) {
    return (
        <MerchantRulePageBase
            policyID={route.params.policyID}
            editCategoryTaxRuleFor={route.params.categoryName}
            titleKey="workspace.rules.merchantRules.editRuleTitle"
            testID="EditCategoryTaxRulePage"
        />
    );
}

export default EditCategoryTaxRulePage;
