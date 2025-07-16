import {useEffect, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import {openApp} from '@libs/actions/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function usePriorityChange() {
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {canBeMissing: true});
    const [allReportsDraftComment] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});
    const prevPriorityMode = useRef(priorityMode);

    useEffect(() => {
        if (prevPriorityMode.current === CONST.PRIORITY_MODE.GSD && priorityMode === CONST.PRIORITY_MODE.DEFAULT) {
            openApp(false, allReportsDraftComment);
        }
        prevPriorityMode.current = priorityMode;
    }, [priorityMode, allReportsDraftComment]);
}

export default usePriorityChange;
