import {filterPersonalCards} from '@selectors/Card';
import {useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import {isCardPendingActivate, isCardPendingIssue} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';

function useTimeSensitiveCards() {
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {selector: filterPersonalCards, canBeMissing: true});

    const {cardsNeedingShippingAddress, cardsNeedingActivation} = useMemo<{cardsNeedingShippingAddress: Card[]; cardsNeedingActivation: Card[]}>(() => {
        const cards = Object.values(cardList ?? {});

        // Find all cards that need a shipping address (state: NOT_ISSUED)
        const pendingIssueCards = cards.filter(
            (card) => isCardPendingIssue(card) && card.bank === CONST.EXPENSIFY_CARD.BANK && !card.nameValuePairs?.isVirtual,
        );

        // Find all cards that need activation (state: NOT_ACTIVATED)
        const pendingActivateCards = cards.filter(
            (card) => isCardPendingActivate(card) && card.bank === CONST.EXPENSIFY_CARD.BANK && !card.nameValuePairs?.isVirtual,
        );

        return {
            cardsNeedingShippingAddress: pendingIssueCards,
            cardsNeedingActivation: pendingActivateCards,
        };
    }, [cardList]);

    const shouldShowAddShippingAddress = cardsNeedingShippingAddress.length > 0;
    const shouldShowActivateCard = cardsNeedingActivation.length > 0;

    return {
        shouldShowAddShippingAddress,
        shouldShowActivateCard,
        cardsNeedingShippingAddress,
        cardsNeedingActivation,
    };
}

export default useTimeSensitiveCards;
