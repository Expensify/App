import {completeReviewWorkspaceSettingsTask} from '@libs/actions/Task';

import CONST from '@src/CONST';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnboardingTaskInformation from './useOnboardingTaskInformation';

/**
 * Returns a callback that completes the "Review your workspace settings" onboarding task with its own request.
 *
 * Reach for it over `useReviewWorkspaceSettingsTaskCompletion` when the command being saved is not one the backend
 * completes the task as a side effect of, which would leave the tick to be undone on the next fetch.
 */
function useCompleteReviewWorkspaceSettingsTask() {
    const {accountID} = useCurrentUserPersonalDetails();
    const taskInformation = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.REVIEW_WORKSPACE_SETTINGS);
    return () => completeReviewWorkspaceSettingsTask(taskInformation, accountID);
}

export default useCompleteReviewWorkspaceSettingsTask;
