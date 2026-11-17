import {clearHomeTodoReview} from '@libs/actions/HomeTodoReview';

import {useFocusEffect} from '@react-navigation/native';

/**
 * Ends the Home to-do review whenever the user is back on Home, so the next `Begin` starts from the row's current
 * reports and a report opened later from elsewhere doesn't page through a stale list.
 */
function useClearHomeTodoReviewOnFocus() {
    useFocusEffect(() => {
        clearHomeTodoReview();
    });
}

export default useClearHomeTodoReviewOnFocus;
