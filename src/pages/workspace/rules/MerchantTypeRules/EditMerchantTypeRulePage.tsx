import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';

import React from 'react';

import MerchantTypeRulePageBase from './MerchantTypeRulePageBase';

type EditMerchantTypeRulePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_TYPE_EDIT>;

function EditMerchantTypeRulePage({route}: EditMerchantTypeRulePageProps) {
    const {policyID, groupID} = route.params;

    return (
        <MerchantTypeRulePageBase
            policyID={policyID}
            groupID={groupID}
            testID="EditMerchantTypeRulePage"
        />
    );
}

export default EditMerchantTypeRulePage;
