import useExpenseDefaultCardNames from '@hooks/useExpenseDefaultCardNames';
import useLocalize from '@hooks/useLocalize';
import usePolicyCards from '@hooks/usePolicyCards';

import {updateDraftMerchantRule} from '@libs/actions/User';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import type {RuleConditionItem} from './RuleConditionMultiSelectPage';

import RuleConditionMultiSelectPage from './RuleConditionMultiSelectPage';
import useMerchantRuleRoute from './useMerchantRuleRoute';

type AddCardToMatchPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_CARD_TO_MATCH | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_CARD_TO_MATCH>;

function AddCardToMatchPage({route}: AddCardToMatchPageProps) {
    const {policyID, ruleID} = route.params;
    const {backToRoute} = useMerchantRuleRoute(DYNAMIC_ROUTES.RULES_CARD_TO_MATCH_FROM_EXPENSE.path, policyID, ruleID);
    const {translate} = useLocalize();
    const {cards: policyCards, isLoadingCards} = usePolicyCards(policyID);
    // `usePolicyCards` already asks for every card, so a second loader here would send the same request twice.
    const cardNames = useExpenseDefaultCardNames(false);

    // Stored as card IDs, which is what the `cardID` filter carries.
    const cardItems: RuleConditionItem[] = policyCards.map((card) => ({
        value: String(card.cardID),
        text: cardNames[String(card.cardID)] ?? translate('workspace.companyCards.deletedCard'),
    }));

    return (
        <RuleConditionMultiSelectPage
            field="cardsToMatch"
            title={translate('common.card')}
            testID="AddCardToMatchPage"
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.MERCHANT_RULE_CARD_TO_MATCH_SAVE}
            backToRoute={backToRoute}
            items={cardItems}
            onSave={(cardsToMatch) => updateDraftMerchantRule({cardsToMatch})}
            getFallbackText={(cardID) => cardNames[cardID] ?? translate('workspace.companyCards.deletedCard')}
            isLoading={isLoadingCards}
        />
    );
}

export default AddCardToMatchPage;
