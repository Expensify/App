import React from 'react';
import {useOnyx} from 'react-native-onyx';
import SpendRuleMerchantsBase from '@components/SpendRules/configuration/SpendRuleMerchantsBase';
import {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type SpendRuleMerchantsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SPEND_RULE_MERCHANTS>;

export default function SpendRuleMerchantsPage({route}: SpendRuleMerchantsPageProps) {
    const policyID = route.params.policyID;
    const [issueNewCardForm] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const merchantNames = issueNewCardForm?.data.spendRuleValue?.merchantNames ?? [];
    const merchantMatchTypes = issueNewCardForm?.data.spendRuleValue?.merchantMatchTypes ?? [];
    const restrictionAction = issueNewCardForm?.data.spendRuleValue?.restrictionAction ?? CONST.SPEND_RULES.ACTION.ALLOW;

    return (
        <SpendRuleMerchantsBase
            policyID={policyID}
            action={restrictionAction}
            merchantNames={merchantNames}
            merchantMatchTypes={merchantMatchTypes}
            getEditMerchantRoute={(merchantIndex) => ROUTES.WORKSPACE_EXPENSIFY_CARD_SPEND_RULE_MERCHANT_EDIT.getRoute(policyID, merchantIndex)}
        />
    );
}
