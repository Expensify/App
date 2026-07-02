import React from 'react';
import SpendRulesCurrencyBase from '@components/SpendRules/configuration/SpendRulesCurrencyBase';
import useOnyx from '@hooks/useOnyx';
import {setIssueNewCardData} from '@libs/actions/Card';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type SpendRuleCurrencyEditPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_SPEND_RULE_CURRENCY>;

export default function SpendRuleCurrencyEditPage({route}: SpendRuleCurrencyEditPageProps) {
    const policyID = route.params.policyID;
    const [issueNewCardForm] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`);

    const currency = issueNewCardForm?.data.currency ?? '';
    const currencies = issueNewCardForm?.data.spendRuleValue?.currencies ?? [];

    const handleCurrenciesChange = (newCurrencies: string[]) => {
        setIssueNewCardData(policyID, {spendRuleValue: {currencies: newCurrencies}});
    };

    return (
        <SpendRulesCurrencyBase
            currencies={currencies}
            settlementCurrency={currency}
            onCurrenciesChange={handleCurrenciesChange}
        />
    );
}
