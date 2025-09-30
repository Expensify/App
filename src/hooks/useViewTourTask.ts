import {isArchivedReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useViewTourTask() {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const viewTourTaskReportID = introSelected?.[CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR];
    const [viewTourTaskReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${viewTourTaskReportID}`, {canBeMissing: true}, [viewTourTaskReportID]);
    const [viewTourTaskParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${viewTourTaskReport?.parentReportID}`, {canBeMissing: true});
    const [viewTourTaskParentReportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${viewTourTaskParentReport?.reportID}`, {canBeMissing: true});

    return {isViewTourParentReportAcrhived: isArchivedReport(viewTourTaskParentReportNameValuePairs)};
}

export default useViewTourTask;
