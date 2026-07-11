import SpendRuleMaxAmountBase from '@components/SpendRules/configuration/SpendRuleMaxAmountBase';

import useDefaultFundID from '@hooks/useDefaultFundID';
import useOnyx from '@hooks/useOnyx';

import {updateDraftSpendRule} from '@libs/actions/User';
import {filterInactiveCards, getSelectedCardsSharedCurrency} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type SpendRuleMaxAmountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_SPEND_MAX_AMOUNT>;

function SpendRuleMaxAmountPage({route}: SpendRuleMaxAmountPageProps) {
    const {policyID} = route.params;
    const domainAccountID = useDefaultFundID(policyID);

    const [spendRuleForm] = useOnyx(ONYXKEYS.FORMS.SPEND_RULE_FORM);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});

    const selectedCurrency = getSelectedCardsSharedCurrency(spendRuleForm?.cardIDs, cardsList) ?? CONST.CURRENCY.USD;
    const defaultValue = spendRuleForm?.maxAmount ?? '';

    return (
        <SpendRuleMaxAmountBase
            policyID={policyID}
            maxAmount={defaultValue}
            currencyCode={selectedCurrency}
            onMaxAmountChange={(maxAmount) => updateDraftSpendRule({maxAmount})}
        />
    );
}

SpendRuleMaxAmountPage.displayName = 'SpendRuleMaxAmountPage';

export default SpendRuleMaxAmountPage;
