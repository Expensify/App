import {useEffect} from 'react';
import usePrevious from '@hooks/usePrevious';
import {openApp} from '@libs/actions/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function usePriorityChange() {
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {canBeMissing: true});
    const [allReportsDraftComment] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});
    const prevPriorityMode = usePrevious(priorityMode);

    useEffect(() => {
        if (!(prevPriorityMode === CONST.PRIORITY_MODE.GSD && priorityMode === CONST.PRIORITY_MODE.DEFAULT)) {
            return;
        }
        openApp(false, allReportsDraftComment);
    }, [priorityMode, allReportsDraftComment, prevPriorityMode]);
}

export default usePriorityChange;
