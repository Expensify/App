import React from 'react';
import SpendRuleMerchantEditBase from '@components/SpendRules/configuration/SpendRuleMerchantEditBase';
import useOnyx from '@hooks/useOnyx';
import {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

type SpendRuleMerchantEditPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_RULE_MERCHANT_EDIT>;

export default function SpendRuleMerchantEditPage({route}: SpendRuleMerchantEditPageProps) {
    const {policyID, merchantIndex} = route.params;
    const [issueNewCardForm] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const merchantNames = issueNewCardForm?.data.cardRuleValue?.merchantNames ?? [];
    const merchantMatchTypes = issueNewCardForm?.data.cardRuleValue?.merchantMatchTypes ?? [];

    return (
        <SpendRuleMerchantEditBase
            policyID={policyID}
            merchantIndex={merchantIndex}
            merchantMatchTypes={merchantMatchTypes}
            merchantNames={merchantNames}
        />
    );
}
