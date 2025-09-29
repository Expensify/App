import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import useOnyx from './useOnyx';

function useGetChatIOUReportIDFromReportAction(reportAction: OnyxTypes.ReportAction | null | undefined): string | undefined {
    const iouReportID = isMoneyRequestAction(reportAction) ? getOriginalMessage(reportAction)?.IOUReportID : undefined;
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {canBeMissing: true});
    return iouReport?.chatReportID;
}

export default useGetChatIOUReportIDFromReportAction;
