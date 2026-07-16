import {reserveDeferredWriteChannel} from '@libs/deferredLayoutWrite';

import CONST from '@src/CONST';

import isReportTopmostSplitNavigator from './isReportTopmostSplitNavigator';

/** A global-create submit off the inbox lands on Search — reserve the channel so the optimistic write defers behind the skeleton. */
function reserveSearchChannelIfGlobalCreate(isFromGlobalCreate: boolean) {
    if (!isFromGlobalCreate || isReportTopmostSplitNavigator()) {
        return;
    }
    reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
}

export default reserveSearchChannelIfGlobalCreate;
