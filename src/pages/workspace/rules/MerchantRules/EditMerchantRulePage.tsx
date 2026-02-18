import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import MerchantRulePageBase from './MerchantRulePageBase';

type EditMerchantRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_EDIT>;

function EditMerchantRulePage({route}: EditMerchantRulePageProps) {
    return (
        <MerchantRulePageBase
            policyID={route.params.policyID}
            ruleID={route.params.ruleID}
            titleKey="workspace.rules.merchantRules.editRuleTitle"
            testID="EditMerchantRulePage"
        />
    );
}

EditMerchantRulePage.displayName = 'EditMerchantRulePage';

export default EditMerchantRulePage;
