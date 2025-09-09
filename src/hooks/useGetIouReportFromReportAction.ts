import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import useOnyx from './useOnyx';

function useGetChatIouReportIDFromReportAction(reportAction: OnyxTypes.ReportAction | null | undefined): string | undefined {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const iouReportID = isMoneyRequestAction(reportAction) ? getOriginalMessage(reportAction)?.IOUReportID : undefined;
    const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`] ?? null;
    return iouReport?.chatReportID;
}

export default useGetChatIouReportIDFromReportAction;
