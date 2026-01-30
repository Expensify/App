import useOnyx from '@hooks/useOnyx';
import {timeSensitiveCardsSelector} from '@selectors/Card';
import ONYXKEYS from '@src/ONYXKEYS';

function useTimeSensitiveCards() {
    const [timeSensitiveCards] = useOnyx(ONYXKEYS.CARD_LIST, {
        canBeMissing: true,
        selector: timeSensitiveCardsSelector,
    });

    const cardsNeedingShippingAddress = timeSensitiveCards?.cardsNeedingShippingAddress ?? [];
    const cardsNeedingActivation = timeSensitiveCards?.cardsNeedingActivation ?? [];
    const cardsWithFraud = timeSensitiveCards?.cardsWithFraud ?? [];

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
