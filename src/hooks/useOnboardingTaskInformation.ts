import ONYXKEYS from '@src/ONYXKEYS';
import type {IntroSelectedTask} from '@src/types/onyx/IntroSelected';
import useHasOutstandingChildTask from './useHasOutstandingChildTask';
import useOnyx from './useOnyx';
import useParentReportAction from './useParentReportAction';
import useReportIsArchived from './useReportIsArchived';

function useOnboardingTaskInformation(taskName: IntroSelectedTask) {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const taskReportID = introSelected?.[taskName];
    const [taskReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`, {canBeMissing: true}, [taskReportID]);
    const [taskParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${taskReport?.parentReportID}`, {canBeMissing: true});
    const hasOutstandingChildTask = useHasOutstandingChildTask(taskReport);
    const isOnboardingTaskParentReportArchived = useReportIsArchived(taskParentReport?.reportID);
    const parentReportAction = useParentReportAction(taskReport);
    return {
        taskReport,
        taskParentReport,
        isOnboardingTaskParentReportArchived,
        hasOutstandingChildTask,
        parentReportAction,
    };
}

export default useOnboardingTaskInformation;
