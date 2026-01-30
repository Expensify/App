import {filterPersonalCards} from '@selectors/Card';
import {useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import {isCardPendingActivate, isCardPendingIssue} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function useTimeSensitiveCards() {
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {selector: filterPersonalCards, canBeMissing: true});

    const {cardNeedingShippingAddress, cardNeedingActivation} = useMemo(() => {
        const cards = Object.values(cardList ?? {});

        // Find the first card that needs a shipping address (state: NOT_ISSUED)
        const pendingIssueCard = cards.find(
            (card) => isCardPendingIssue(card) && card.bank === CONST.EXPENSIFY_CARD.BANK && !card.nameValuePairs?.isVirtual,
        );

        // Find the first card that needs activation (state: NOT_ACTIVATED)
        const pendingActivateCard = cards.find(
            (card) => isCardPendingActivate(card) && card.bank === CONST.EXPENSIFY_CARD.BANK && !card.nameValuePairs?.isVirtual,
        );

        return {
            cardNeedingShippingAddress: pendingIssueCard,
            cardNeedingActivation: pendingActivateCard,
        };
    }, [cardList]);

    const shouldShowAddShippingAddress = !!cardNeedingShippingAddress;
    const shouldShowActivateCard = !!cardNeedingActivation;

    return {
        shouldShowAddShippingAddress,
        shouldShowActivateCard,
        cardNeedingShippingAddress,
        cardNeedingActivation,
    };
}

export default useTimeSensitiveCards;
