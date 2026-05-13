import {useEffect} from 'react';
import CONST from './CONST';
import useOnyx from './hooks/useOnyx';
import usePrevious from './hooks/usePrevious';
import {openApp} from './libs/actions/App';
import ONYXKEYS from './ONYXKEYS';

/**
 * Component that does not render anything but isolates priority-mode–related Onyx subscriptions
 * (NVP_PRIORITY_MODE, COLLECTION.REPORT_DRAFT_COMMENT) from the root Expensify component so that
 * changes to these keys do not re-render the entire navigation tree.
 */
function PriorityModeHandler() {
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE);
    const [allReportsWithDraftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT);
    const prevPriorityMode = usePrevious(priorityMode);

    useEffect(() => {
        if (!(prevPriorityMode === CONST.PRIORITY_MODE.GSD && priorityMode === CONST.PRIORITY_MODE.DEFAULT)) {
            return;
        }
        // When a user switches their priority mode away from #focus/GSD we need to call openApp
        // to fetch all their chats because #focus mode works with a subset of a user's chats.
        openApp(false, allReportsWithDraftComments);
    }, [priorityMode, allReportsWithDraftComments, prevPriorityMode]);

    return null;
}

export default PriorityModeHandler;
