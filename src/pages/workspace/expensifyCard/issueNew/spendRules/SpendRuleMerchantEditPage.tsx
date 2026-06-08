import React from 'react';
import SpendRuleMerchantEditBase from '@components/SpendRules/configuration/SpendRuleMerchantEditBase';
import useOnyx from '@hooks/useOnyx';
import {setIssueNewCardData} from '@libs/actions/Card';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type SpendRuleMerchantEditPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_MERCHANT_EDIT>;

export default function SpendRuleMerchantEditPage({route}: SpendRuleMerchantEditPageProps) {
    const {policyID, merchantIndex} = route.params;
    const [issueNewCardForm] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const merchantNames = issueNewCardForm?.data.spendRuleValue?.merchantNames ?? [];
    const merchantMatchTypes = issueNewCardForm?.data.spendRuleValue?.merchantMatchTypes ?? [];

    return (
        <SpendRuleMerchantEditBase
            policyID={policyID}
            merchantIndex={merchantIndex}
            merchantMatchTypes={merchantMatchTypes}
            merchantNames={merchantNames}
            onMerchantDataChange={(newMerchantNames, newMerchantMatchTypes) => {
                setIssueNewCardData(policyID, {spendRuleValue: {merchantNames: newMerchantNames, merchantMatchTypes: newMerchantMatchTypes}});
            }}
        />
    );
}
