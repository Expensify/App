import {isArchivedReport} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {IntroSelectedTask} from '@src/types/onyx/IntroSelected';
import useOnyx from './useOnyx';

function useOnboardingTask(taskName: IntroSelectedTask) {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    // const viewTourTaskReportID = introSelected?.[CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR];
    const taskReportID = introSelected?.[taskName];
    const [taskReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`, {canBeMissing: true}, [taskReportID]);
    const [taskParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${taskReport?.parentReportID}`, {canBeMissing: true});
    const [taskParentReportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${taskParentReport?.reportID}`, {canBeMissing: true});

    return {isViewTourParentReportAcrhived: isArchivedReport(taskParentReportNameValuePairs)};
}

export default useOnboardingTask;
