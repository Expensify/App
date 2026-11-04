import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';

import React from 'react';

import ExpenseDefaultRulePageBase from './ExpenseDefaultRulePageBase';

type EditMerchantRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_EDIT>;

function EditMerchantRulePage({route}: EditMerchantRulePageProps) {
    return (
        <ExpenseDefaultRulePageBase
            policyID={route.params.policyID}
            ruleID={route.params.ruleID}
            testID="EditMerchantRulePage"
        />
    );
}

EditMerchantRulePage.displayName = 'EditMerchantRulePage';

export default EditMerchantRulePage;
