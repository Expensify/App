import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeedErrors} from '@src/types/onyx/DerivedValues';
import useOnyx from './useOnyx';

const DEFAULT_CARD_FEED_ERRORS: CardFeedErrors = {
    cardFeedErrors: {},
    cardsWithBrokenFeedConnection: {},
    shouldShowRBR: false,
    rbrWorkspaceAccountIDMapping: {},
    rbrFeedNameWithDomainIDMapping: {},
    isFeedConnectionBroken: false,
    hasFeedErrors: false,
    hasWorkspaceErrors: false,
    hasFailedCardAssignment: false,
};

function useCardFeedErrors(): CardFeedErrors {
    const [cardFeedErrors] = useOnyx(ONYXKEYS.DERIVED.CARD_FEED_ERRORS, {canBeMissing: true});

    return cardFeedErrors ?? DEFAULT_CARD_FEED_ERRORS;
}

export default useCardFeedErrors;
