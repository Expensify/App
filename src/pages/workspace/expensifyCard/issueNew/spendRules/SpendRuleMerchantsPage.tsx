import React from 'react';
import {useOnyx} from 'react-native-onyx';
import SpendRuleMerchantsBase from '@components/SpendRules/configuration/SpendRuleMerchantsBase';
import {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

type SpendRuleMerchantsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_RULE_MERCHANTS>;

export default function SpendRuleMerchantsPage({route}: SpendRuleMerchantsPageProps) {
    const policyID = route.params.policyID;
    const [issueNewCardForm] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const merchantNames = issueNewCardForm?.data.cardRuleValue?.merchantNames ?? [];
    const merchantMatchTypes = issueNewCardForm?.data.cardRuleValue?.merchantMatchTypes ?? [];
    const restrictionAction = issueNewCardForm?.data.cardRuleValue?.restrictionAction ?? CONST.SPEND_RULES.ACTION.ALLOW;

    return (
        <SpendRuleMerchantsBase
            policyID={policyID}
            action={restrictionAction}
            merchantNames={merchantNames}
            merchantMatchTypes={merchantMatchTypes}
        />
    );
}
