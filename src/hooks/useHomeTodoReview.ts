import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

import useOnyx from './useOnyx';

/** Returns the Home to-do review and whether the report, opened from Home, is one of its reports */
function useHomeTodoReview(reportID: string | undefined, backTo: Route | undefined) {
    const [homeTodoReview] = useOnyx(ONYXKEYS.RAM_ONLY_HOME_TODO_REVIEW);
    const isInHomeTodoReview = backTo === ROUTES.HOME && !!reportID && !!homeTodoReview?.reportIDs.includes(reportID);
    return {homeTodoReview, isInHomeTodoReview};
}

export default useHomeTodoReview;
