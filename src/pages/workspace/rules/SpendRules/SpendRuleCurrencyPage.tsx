import React from 'react';
import SpendRulesCurrencyBase from '@components/SpendRules/configuration/SpendRulesCurrencyBase';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useOnyx from '@hooks/useOnyx';
import {updateDraftSpendRule} from '@libs/actions/User';
import {filterInactiveCards, getSelectedCardsSharedCurrency} from '@libs/CardUtils';
import {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

type SpendRuleCurrenciesPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_SPEND_CURRENCIES>;

export default function SpendRuleCurrenciesPage({route}: SpendRuleCurrenciesPageProps) {
    const policyID = route.params.policyID;
    const domainAccountID = useDefaultFundID(policyID);
    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});

    const cardIDs = spendRuleForm?.cardIDs ?? [];
    const currencies = spendRuleForm?.currencies ?? [];
    const selectedCurrency = getSelectedCardsSharedCurrency(cardIDs, cardsList) ?? '';

    const onCurrenciesChange = (currencies: string[]) => {
        updateDraftSpendRule({currencies});
    };

    return (
        <SpendRulesCurrencyBase
            currencies={currencies}
            settlementCurrency={selectedCurrency}
            onCurrenciesChange={onCurrenciesChange}
        />
    );
}
