import ONYXKEYS from '@src/ONYXKEYS';
import type {HomeTodoSearchKey} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

/**
 * A Home to-do review starts when the user presses `Begin` on a report row (submit, approve, pay or export). It holds
 * the row's reports so the report screen can page through them and move on to the next one after each action. It
 * ends when the user is back on Home.
 */

function startHomeTodoReview(searchKey: HomeTodoSearchKey, reportIDs: string[]) {
    return Onyx.set(ONYXKEYS.RAM_ONLY_HOME_TODO_REVIEW, {searchKey, reportIDs});
}

function clearHomeTodoReview() {
    return Onyx.set(ONYXKEYS.RAM_ONLY_HOME_TODO_REVIEW, null);
}

export {startHomeTodoReview, clearHomeTodoReview};
