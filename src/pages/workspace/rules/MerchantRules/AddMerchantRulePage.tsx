import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import MerchantRulePageBase from './MerchantRulePageBase';

type AddMerchantRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_NEW>;

function AddMerchantRulePage({route}: AddMerchantRulePageProps) {
    return (
        <MerchantRulePageBase
            policyID={route.params.policyID}
            titleKey="workspace.rules.merchantRules.addRuleTitle"
            testID="AddMerchantRulePage"
        />
    );
}

AddMerchantRulePage.displayName = 'AddMerchantRulePage';

export default AddMerchantRulePage;
