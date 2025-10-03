import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import useOnyx from './useOnyx';
import useReportIsArchived from './useReportIsArchived';

function useGetIOUReportFromReportAction(reportAction: OnyxTypes.ReportAction | null | undefined): {
    iouReport: OnyxTypes.Report | undefined;
    chatReport: OnyxTypes.Report | undefined;
    isChatIOUReportArchived: boolean;
} {
    const iouReportID = isMoneyRequestAction(reportAction) ? getOriginalMessage(reportAction)?.IOUReportID : undefined;
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {canBeMissing: true}) ?? null;
    const isChatIOUReportArchived = useReportIsArchived(iouReportID);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`, {canBeMissing: true});
    return {iouReport, chatReport, isChatIOUReportArchived};
}

export default useGetIOUReportFromReportAction;
