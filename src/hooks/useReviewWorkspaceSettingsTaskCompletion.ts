import {getReviewWorkspaceSettingsTaskCompletionData} from '@libs/actions/Task';

import CONST from '@src/CONST';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnboardingTaskInformation from './useOnboardingTaskInformation';

/**
 * Returns a getter that builds the optimistic Onyx data completing the "Review your workspace settings" onboarding
 * task, to be merged into a workspace-settings write command's onyxData.
 *
 * The getter is intentionally lazy: `getReviewWorkspaceSettingsTaskCompletionData` mints a fresh optimistic
 * `reportActionID` on every call, so it must run at save time (not eagerly per render).
 */
function useReviewWorkspaceSettingsTaskCompletion() {
    const {accountID} = useCurrentUserPersonalDetails();
    const taskInformation = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.REVIEW_WORKSPACE_SETTINGS);
    return () => getReviewWorkspaceSettingsTaskCompletionData(taskInformation, accountID);
}

export default useReviewWorkspaceSettingsTaskCompletion;
