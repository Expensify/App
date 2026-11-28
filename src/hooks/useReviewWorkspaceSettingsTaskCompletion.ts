import {getReviewWorkspaceSettingsTaskCompletionData} from '@libs/actions/Task';
import {isSupportedPendingInviteOnboarding} from '@libs/OnboardingUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnboardingTaskInformation from './useOnboardingTaskInformation';
import useOnyx from './useOnyx';
import useOpenReport from './useOpenReport';

/**
 * Returns a getter that builds the optimistic Onyx data completing the "Review your workspace settings" onboarding
 * task, to be merged into a workspace-settings write command's onyxData.
 *
 * The getter is intentionally lazy: `getReviewWorkspaceSettingsTaskCompletionData` mints a fresh optimistic
 * `reportActionID` on every call, so it must run at save time (not eagerly per render).
 *
 * An invited admin who changes a setting before opening Concierge has no onboarding tasks yet, because only the guided
 * setup inside `openReport` creates them. The getter then runs that setup right away with this task already completed.
 */
function useReviewWorkspaceSettingsTaskCompletion() {
    const {accountID} = useCurrentUserPersonalDetails();
    const taskInformation = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.REVIEW_WORKSPACE_SETTINGS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [hasConciergeReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${conciergeReportID}`, {selector: Boolean});
    const openReport = useOpenReport();

    return () => {
        // Only the admin invite flow has this task, so other invite flows keep waiting for the user to open a chat.
        const isPendingAdminInviteOnboarding = introSelected?.choice === CONST.ONBOARDING_CHOICES.ADMIN && isSupportedPendingInviteOnboarding(introSelected);
        if (!taskInformation.taskReport && conciergeReportID && isPendingAdminInviteOnboarding) {
            openReport({
                reportID: conciergeReportID,
                hasReportActions: hasConciergeReportActions,
                // The user has not opened Concierge, so it stays unread.
                shouldMarkAsRead: false,
                shouldAutoCompleteReviewWorkspaceSettingsTask: true,
            });
            return {};
        }

        return getReviewWorkspaceSettingsTaskCompletionData(taskInformation, accountID);
    };
}

export default useReviewWorkspaceSettingsTaskCompletion;
