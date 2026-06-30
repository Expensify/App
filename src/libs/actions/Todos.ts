import ONYXKEYS from '@src/ONYXKEYS';
import {setNameValuePair} from './User';

/**
 * Persists a one-time flag (server-side NVP) the first time an actionable to-do appears in the "For You" section so the
 * section stays visible afterwards across sessions and devices, even when it later goes empty.
 */
function setHasSeenForYouTodo() {
    setNameValuePair(ONYXKEYS.NVP_HAS_SEEN_FOR_YOU_TODO, true, false);
}

// eslint-disable-next-line import/prefer-default-export
export {setHasSeenForYouTodo};
