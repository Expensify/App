import {markPendingSearchWrite} from '@libs/pendingSearchWrite';

import isReportTopmostSplitNavigator from './isReportTopmostSplitNavigator';

/** A global-create submit off the inbox lands on Search - raise the signal so the optimistic write defers behind the skeleton. */
function markPendingSearchWriteIfGlobalCreate(isFromGlobalCreate: boolean) {
    if (!isFromGlobalCreate || isReportTopmostSplitNavigator()) {
        return;
    }
    markPendingSearchWrite();
}

export default markPendingSearchWriteIfGlobalCreate;
