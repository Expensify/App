import {useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import {isCard, isCardPendingActivate, isCardPendingIssue} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';

function useTimeSensitiveCards() {
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});

    const {cardsNeedingShippingAddress, cardsNeedingActivation} = useMemo<{cardsNeedingShippingAddress: Card[]; cardsNeedingActivation: Card[]}>(() => {
        const cards = Object.values(cardList ?? {}).filter(isCard);
        const isPhysicalExpensifyCard = (card: Card) => card.bank === CONST.EXPENSIFY_CARD.BANK && !card.nameValuePairs?.isVirtual;

        return cards.reduce<{cardsNeedingShippingAddress: Card[]; cardsNeedingActivation: Card[]}>(
            (acc, card) => {
                if (!isPhysicalExpensifyCard(card)) {
                    return acc;
                }

                if (isCardPendingIssue(card)) {
                    acc.cardsNeedingShippingAddress.push(card);
                }

                if (isCardPendingActivate(card)) {
                    acc.cardsNeedingActivation.push(card);
                }

                return acc;
            },
            {cardsNeedingShippingAddress: [], cardsNeedingActivation: []},
        );
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
