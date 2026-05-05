import React from 'react';
import SpendRuleMaxAmountBase from '@components/SpendRules/configuration/SpendRuleMaxAmountBase';
import useOnyx from '@hooks/useOnyx';
import {setIssueNewCardData} from '@libs/actions/Card';
import {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

type SpendRuleMaxAmountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_RULE_MAX_AMOUNT>;

export default function SpendRuleMaxAmountPage({route}: SpendRuleMaxAmountPageProps) {
    const {policyID} = route.params;
    const [issueNewCardForm] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const defaultValue = issueNewCardForm?.data.cardRuleValue?.maxAmount ?? '';
    const selectedCurrency = issueNewCardForm?.data.currency ?? CONST.CURRENCY.USD;

    const handleMaxAmountChange = (maxAmount: string) => {
        setIssueNewCardData(policyID, {cardRuleValue: {maxAmount}});
    };

    return (
        <SpendRuleMaxAmountBase
            policyID={policyID}
            maxAmount={defaultValue}
            currencyCode={selectedCurrency}
            onMaxAmountChange={handleMaxAmountChange}
        />
    );
}
