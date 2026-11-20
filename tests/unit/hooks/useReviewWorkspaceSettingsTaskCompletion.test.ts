import {renderHook} from '@testing-library/react-native';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOpenReport from '@hooks/useOpenReport';
import useReviewWorkspaceSettingsTaskCompletion from '@hooks/useReviewWorkspaceSettingsTaskCompletion';

import {getReviewWorkspaceSettingsTaskCompletionData} from '@libs/actions/Task';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {IntroSelected} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useCurrentUserPersonalDetails');
jest.mock('@hooks/useOnboardingTaskInformation');
jest.mock('@hooks/useOpenReport');
jest.mock('@libs/actions/Task', () => ({
    getReviewWorkspaceSettingsTaskCompletionData: jest.fn(() => ({completedTaskReportActionID: 'completedAction'})),
}));

const ACCOUNT_ID = 1;
const CONCIERGE_REPORT_ID = '100';
const TASK_REPORT_ID = '200';
const mockOpenReport = jest.fn();

async function renderWithIntroSelected(introSelected: IntroSelected) {
    await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, introSelected);
    await waitForBatchedUpdates();
    const {result} = renderHook(() => useReviewWorkspaceSettingsTaskCompletion());
    await waitForBatchedUpdates();
    return result;
}

describe('useReviewWorkspaceSettingsTaskCompletion', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.mocked(useOpenReport).mockReturnValue(mockOpenReport);
        jest.mocked(useCurrentUserPersonalDetails).mockReturnValue(createMock<ReturnType<typeof useCurrentUserPersonalDetails>>({accountID: ACCOUNT_ID}));
        jest.mocked(useOnboardingTaskInformation).mockReturnValue(createMock<ReturnType<typeof useOnboardingTaskInformation>>({taskReport: undefined}));
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
        await waitForBatchedUpdates();
    });

    it('should create the task already completed when an invited admin saves a setting before opening Concierge', async () => {
        // Given an invited admin whose guided setup has not run, so the task does not exist yet
        const result = await renderWithIntroSelected({choice: CONST.ONBOARDING_CHOICES.ADMIN, inviteType: CONST.ONBOARDING_INVITE_TYPES.WORKSPACE, isInviteOnboardingComplete: false});

        // When the admin saves a workspace setting
        const taskData = result.current();

        // Then the guided setup runs now with the task completed, and Concierge stays unread because the admin has not opened it
        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({reportID: CONCIERGE_REPORT_ID, shouldMarkAsRead: false, shouldAutoCompleteReviewWorkspaceSettingsTask: true}));
        expect(taskData).toEqual({});
        expect(getReviewWorkspaceSettingsTaskCompletionData).not.toHaveBeenCalled();
    });

    it('should not run the guided setup early for an invite flow that has no review task', async () => {
        // Given an invited submitter, whose onboarding has no review task, saving a setting on a workspace they manage
        const result = await renderWithIntroSelected({choice: CONST.ONBOARDING_CHOICES.SUBMIT, inviteType: CONST.ONBOARDING_INVITE_TYPES.WORKSPACE, isInviteOnboardingComplete: false});

        // When they save a workspace setting
        result.current();

        // Then their guided setup still waits for them to open a chat
        expect(mockOpenReport).not.toHaveBeenCalled();
        expect(getReviewWorkspaceSettingsTaskCompletionData).toHaveBeenCalled();
    });

    it('should complete the existing task through the settings command once the guided setup has run', async () => {
        // Given an invited admin whose guided setup already created the task
        jest.mocked(useOnboardingTaskInformation).mockReturnValue(
            createMock<ReturnType<typeof useOnboardingTaskInformation>>({taskReport: {reportID: TASK_REPORT_ID, type: CONST.REPORT.TYPE.TASK}}),
        );
        const result = await renderWithIntroSelected({choice: CONST.ONBOARDING_CHOICES.ADMIN, inviteType: CONST.ONBOARDING_INVITE_TYPES.WORKSPACE, isInviteOnboardingComplete: true});

        // When the admin saves a workspace setting
        const taskData = result.current();

        // Then the settings command carries the completion, and no second guided setup is sent
        expect(mockOpenReport).not.toHaveBeenCalled();
        expect(taskData).toEqual({completedTaskReportActionID: 'completedAction'});
    });
});
