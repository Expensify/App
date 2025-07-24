import {useEffect} from 'react';
import {openApp} from '@libs/actions/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';
import usePrevious from './usePrevious';

function usePriorityMode() {
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {canBeMissing: true});
    const [allReportsWithDraftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});
    const prevPriorityMode = usePrevious(priorityMode);

    useEffect(() => {
        if (!(prevPriorityMode === CONST.PRIORITY_MODE.GSD && priorityMode === CONST.PRIORITY_MODE.DEFAULT)) {
            return;
        }
        // When a user switches their priority mode away from #focus/GSD we need to call openApp
        // to fetch all their chats because #focus mode works with a subset of a user's chats.
        openApp(false, allReportsWithDraftComments);
    }, [priorityMode, allReportsWithDraftComments, prevPriorityMode]);
}

export default usePriorityMode;
