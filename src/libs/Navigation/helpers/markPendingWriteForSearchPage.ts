import {markPendingSearchWrite} from '@libs/pendingSearchWrite';

import isReportTopmostSplitNavigator from './isReportTopmostSplitNavigator';

/**
 * Marks Search's pending-write signal when this submit started from the FAB and isn't inside a
 *  report - meaning it's landing on Search - so the write waits until Search's skeleton is
 *  replaced by real content before applying its optimistic data.
 */
function markPendingWriteForSearchPage(isFromGlobalCreate: boolean) {
    if (!isFromGlobalCreate || isReportTopmostSplitNavigator()) {
        return;
    }
    markPendingSearchWrite();
}

export default markPendingWriteForSearchPage;
