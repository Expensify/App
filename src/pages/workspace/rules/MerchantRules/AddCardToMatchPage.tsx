import useExpenseDefaultConditionNames from '@hooks/useExpenseDefaultConditionNames';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import usePolicyCards from '@hooks/usePolicyCards';

import {updateDraftMerchantRule} from '@libs/actions/User';
import {getCardDescription} from '@libs/CardUtils';
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
    const policy = usePolicy(policyID);
    const {cards: policyCards, isLoadingCards} = usePolicyCards(policyID);
    const {cards: cardNames} = useExpenseDefaultConditionNames(policy);

    // Stored as card IDs, which is what the `cardID` filter carries.
    const cardItems: RuleConditionItem[] = policyCards.map((card) => ({
        value: String(card.cardID),
        text: getCardDescription(card, translate),
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
            getFallbackText={(cardID) => cardNames?.[cardID] ?? cardID}
            isLoading={isLoadingCards}
        />
    );
}

export default AddCardToMatchPage;
