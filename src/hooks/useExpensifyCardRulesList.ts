import {filterInactiveCards, getCardDescriptionForSearchTable, getSelectedCardsSharedCurrency} from '@libs/CardUtils';
import {convertToBackendAmount, convertToDisplayString} from '@libs/CurrencyUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getSpendRuleFormValuesFromCardRule, getSpendRuleSummaryParts, getTruncatedSpendRuleSummary} from '@libs/SpendRulesUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import useDefaultFundID from './useDefaultFundID';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

export default function useExpensifyCardRules(policyID: string) {
    const {isOffline} = useNetwork();
    const defaultFundID = useDefaultFundID(policyID);
    const {translate, localeCompare} = useLocalize();

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [expensifyCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const [cardsList, cardsListResult] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${defaultFundID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});

    const cardRuleValues = Object.entries(expensifyCardSettings?.cardRules ?? {});
    const isLoadingCardRules = !isOffline && (isLoadingOnyxValue(cardsListResult) || !expensifyCardSettings || expensifyCardSettings.isLoading) && !expensifyCardSettings?.hasOnceLoaded;

    const cardRules = cardRuleValues
        .map(([ruleID, cardRule]) => {
            const formValues = getSpendRuleFormValuesFromCardRule(cardRule);

            if (!formValues) {
                return undefined;
            }

            const activeCardIDs = formValues.cardIDs.filter((cardID) => !!cardsList?.[cardID]);

            if (activeCardIDs.length === 0) {
                return undefined;
            }

            const cardNames: string[] = [];
            const cardOwnerDisplayNames: string[] = [];

            for (const cardID of activeCardIDs) {
                const card = cardsList?.[cardID];

                if (!card) {
                    continue;
                }

                const accountID = card.accountID ?? CONST.DEFAULT_NUMBER_ID;
                const displayName = getDisplayNameOrDefault(personalDetails?.[accountID], '', false);
                cardNames.push(getCardDescriptionForSearchTable(card, translate, displayName || undefined) || cardID);
                cardOwnerDisplayNames.push(displayName);
            }

            const selectedCurrency = getSelectedCardsSharedCurrency(activeCardIDs, cardsList);
            const summaryParts = getSpendRuleSummaryParts(formValues.restrictionAction, formValues, selectedCurrency, translate, convertToDisplayString);
            const cardSummary = getTruncatedSpendRuleSummary(cardNames, (summary, count) => translate('workspace.rules.spendRules.summaryMoreCount', {summary, count}));
            const formattedAmount = convertToDisplayString(convertToBackendAmount(Number.parseFloat(formValues.maxAmount)), selectedCurrency ?? CONST.CURRENCY.USD);
            const accessibilityLabel = `${summaryParts.map((part) => `${part.badgeLabel}. ${part.text}`).join('. ')}. ${cardSummary}`;

            return {
                ruleID,
                cardSummary,
                summaryParts,
                formValues,
                accessibilityLabel,
                created: cardRule.created,
                currencyCode: selectedCurrency,
                action: formValues.restrictionAction,
                pendingAction: cardRule.pendingAction,
                isBlock: formValues.restrictionAction === CONST.SPEND_RULES.ACTION.BLOCK,
                searchTokens: [...cardNames, ...formValues.merchantNames, ...formValues.categories, formattedAmount],
            };
        })
        .filter((rule): rule is NonNullable<typeof rule> => rule !== undefined && (isOffline || rule.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE))
        .sort((a, b) => localeCompare(a.created, b.created));

    return {cardRules, isLoadingCardRules};
}
