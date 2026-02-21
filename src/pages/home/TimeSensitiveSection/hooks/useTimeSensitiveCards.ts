import useOnyx from '@hooks/useOnyx';
import {isCard, isCardPendingActivate, isCardPendingIssue, isCardWithPotentialFraud, isExpensifyCard} from '@libs/CardUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';

function useTimeSensitiveCards() {
    const [cards] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});

    const cardsNeedingShippingAddress: Card[] = [];
    const cardsNeedingActivation: Card[] = [];
    const cardsWithFraud: Card[] = [];

    for (const card of Object.values(cards ?? {})) {
        if (!isCard(card)) {
            continue;
        }

        if (!isExpensifyCard(card)) {
            continue;
        }

        if (isCardWithPotentialFraud(card) && card.nameValuePairs?.possibleFraud?.fraudAlertReportID) {
            cardsWithFraud.push(card);
        }

        const isPhysicalCard = !card.nameValuePairs?.isVirtual;
        if (!isPhysicalCard) {
            continue;
        }

        if (isCardPendingIssue(card)) {
            cardsNeedingShippingAddress.push(card);
        }

        if (isCardPendingActivate(card)) {
            cardsNeedingActivation.push(card);
        }
    }

    const shouldShowAddShippingAddress = cardsNeedingShippingAddress.length > 0;
    const shouldShowActivateCard = cardsNeedingActivation.length > 0;
    const shouldShowReviewCardFraud = cardsWithFraud.length > 0;

    return {
        shouldShowAddShippingAddress,
        shouldShowActivateCard,
        shouldShowReviewCardFraud,
        cardsNeedingShippingAddress,
        cardsNeedingActivation,
        cardsWithFraud,
    };
}

export default useTimeSensitiveCards;
