import useOnyx from '@hooks/useOnyx';
import {isTripRoom} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

function useTripRoomReports(): Report[] {
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);

    return Object.values(reports ?? {}).filter((report): report is Report => !!report && isTripRoom(report));
}

export default useTripRoomReports;
