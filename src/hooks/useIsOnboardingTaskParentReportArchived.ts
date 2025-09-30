import ONYXKEYS from '@src/ONYXKEYS';
import type {IntroSelectedTask} from '@src/types/onyx/IntroSelected';
import useOnyx from './useOnyx';
import useReportIsArchived from './useReportIsArchived';

function useIsOnboardingTaskParentReportArchived(taskName: IntroSelectedTask) {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const taskReportID = introSelected?.[taskName];
    const [taskReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`, {canBeMissing: true}, [taskReportID]);
    const [taskParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${taskReport?.parentReportID}`, {canBeMissing: true});

    return useReportIsArchived(taskParentReport?.reportID);
}

export default useIsOnboardingTaskParentReportArchived;
