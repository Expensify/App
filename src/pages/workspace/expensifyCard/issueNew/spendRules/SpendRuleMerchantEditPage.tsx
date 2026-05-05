import React from 'react';
import {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {SettingsNavigatorParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

type SpendRuleMerchantEditPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_RULE_CATEGORY>;

export default function SpendRuleMerchantEditPage({route}: SpendRuleMerchantEditPageProps) {
    const policyID = route.params.policyID;

    return <></>;
}
