import {expensifyLoginsSelector, isCurrentUserValidated} from '@libs/UserUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

/**
 * The join-workspace intent's Concierge tasks each link to a screen that only makes sense until that step is done.
 * Once it is, the task becomes inert - no link, no press target, no disclosure arrow and no checkbox - because the
 * underlying command rejects a second attempt (AddWorkEmail returns 403 for an account validated in the meantime).
 *
 * Completion alone is not enough to lock a task: the user can tick the checkbox by hand without having done the step,
 * and that must stay reversible. So each task is matched against evidence that its own action actually happened.
 */
export default function useIsFinishedJoinWorkspaceTask(taskReportID: string | undefined, isTaskCompleted: boolean): boolean {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [joinablePolicies] = useOnyx(ONYXKEYS.JOINABLE_POLICIES);

    if (!isTaskCompleted || !taskReportID) {
        return false;
    }

    // AddWorkEmail is what writes shouldValidate, so an undefined value means no work email was ever submitted.
    if (taskReportID === introSelected?.addWorkEmail) {
        return onboardingValues?.shouldValidate !== undefined;
    }

    if (taskReportID === introSelected?.validateEmail) {
        return isCurrentUserValidated(loginList, session?.email);
    }

    // Joining removes the workspace from the joinable list, so an empty list means there is nothing left to join.
    if (taskReportID === introSelected?.joinWorkspace) {
        return Object.keys(joinablePolicies ?? {}).length === 0;
    }

    return false;
}
