import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';

import React from 'react';

import ExpenseDefaultRulePageBase from './ExpenseDefaultRulePageBase';

type AddMerchantRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_NEW | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_NEW>;

function AddMerchantRulePage({route}: AddMerchantRulePageProps) {
    const {policyID} = route.params;

    return (
        <ExpenseDefaultRulePageBase
            policyID={policyID}
            initialCategoryName={route.params.categoryName}
            testID="AddMerchantRulePage"
        />
    );
}

AddMerchantRulePage.displayName = 'AddMerchantRulePage';

export default AddMerchantRulePage;
