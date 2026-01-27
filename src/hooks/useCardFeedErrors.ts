import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeedErrors, CardFeedErrorState} from '@src/types/onyx/DerivedValues';
import useOnyx from './useOnyx';

const DEFAULT_CARD_FEED_ERROR_STATE: CardFeedErrorState = {
    shouldShowRBR: false,
    isFeedConnectionBroken: false,
    hasFeedErrors: false,
    // hasWorkspaceErrors: false,
};

const DEFAULT_CARD_FEED_ERRORS: CardFeedErrors = {
    cardFeedErrors: {},
    cardsWithBrokenFeedConnection: {},
    shouldShowRbrForWorkspaceAccountID: {},
    shouldShowRbrForFeedNameWithDomainID: {},
    all: DEFAULT_CARD_FEED_ERROR_STATE,
    companyCards: DEFAULT_CARD_FEED_ERROR_STATE,
    expensifyCard: DEFAULT_CARD_FEED_ERROR_STATE,
};

function useCardFeedErrors(): CardFeedErrors {
    const [cardFeedErrors] = useOnyx(ONYXKEYS.DERIVED.CARD_FEED_ERRORS, {canBeMissing: true});

    return cardFeedErrors ?? DEFAULT_CARD_FEED_ERRORS;
}

export default useCardFeedErrors;
