import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function clearUserSearchPhrase() {
    Onyx.merge(ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE, '');
}

/**
 * Persists user search phrase from the serch input across the screens.
 */
function updateUserSearchPhrase(value: string) {
    Onyx.merge(ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE, value);
}

export {clearUserSearchPhrase, updateUserSearchPhrase};
