import useOnyx from '@hooks/useOnyx';

import {isTripRoom} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

function useTripRoomReports(): readonly Report[] {
    // Filtered in the selector, so writes to other reports don't re-render Home.
    const [tripRoomReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports: OnyxCollection<Report>) => Object.values(reports ?? {}).filter((report): report is Report => !!report && isTripRoom(report)),
    });

    return tripRoomReports ?? CONST.EMPTY_ARRAY;
}

export default useTripRoomReports;
