import ONYXKEYS from '@src/ONYXKEYS';
import type {AllCardFeedErrors} from '@src/types/onyx/DerivedValues';
import useOnyx from './useOnyx';

function useCardFeedErrors(): AllCardFeedErrors {
    const [cardFeedErrors] = useOnyx(ONYXKEYS.DERIVED.CARD_FEED_ERRORS, {canBeMissing: true});

    return cardFeedErrors ?? ({} as AllCardFeedErrors);
}

export default useCardFeedErrors;
