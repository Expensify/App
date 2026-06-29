import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Persists a one-time flag the first time an actionable to-do appears in the "For You" section so the section stays
 * visible permanently afterwards, even when it later goes empty.
 */
function setHasSeenForYouTodo() {
    Onyx.merge(ONYXKEYS.HAS_SEEN_FOR_YOU_TODO, true);
}

// eslint-disable-next-line import/prefer-default-export
export {setHasSeenForYouTodo};
