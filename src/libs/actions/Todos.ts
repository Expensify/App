import ONYXKEYS from '@src/ONYXKEYS';
import {setNameValuePair} from './User';

/** Persists a one-time NVP the first time a "For You" to-do appears, so the section stays visible across sessions. */
function setHasSeenForYouTodo() {
    setNameValuePair(ONYXKEYS.NVP_HAS_SEEN_FOR_YOU_TODO, true, false);
}

// eslint-disable-next-line import/prefer-default-export
export {setHasSeenForYouTodo};
