import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {clearCopyPolicySettings, requestCopyPolicySettingsNotification, setCopyPolicySettingsData} from '@libs/actions/Policy/CopyPolicySettings';
import {navigateToConciergeChat} from '@libs/actions/Report';
import CopyPolicySettingsProgressModal from '@pages/workspace/copyPolicySettings/CopyPolicySettingsProgressModal';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type MockConfirmModalProps = {
    isVisible?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    title?: string;
    prompt?: string;
    confirmText?: string;
    cancelText?: string;
    shouldShowCancelButton?: boolean;
    shouldHandleNavigationBack?: boolean;
    success?: boolean;
};

let lastModalProps: MockConfirmModalProps | undefined;

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({
    accountID: 12345,
}));

jest.mock('@components/ConfirmModal', () => {
    return (props: MockConfirmModalProps) => {
        lastModalProps = props;
        return null;
    };
});

jest.mock('@libs/actions/Policy/CopyPolicySettings', () => ({
    clearCopyPolicySettings: jest.fn(),
    requestCopyPolicySettingsNotification: jest.fn(),
    setCopyPolicySettingsData: jest.fn(),
}));

jest.mock('@libs/actions/Report', () => ({
    navigateToConciergeChat: jest.fn(),
}));

jest.mock('@src/selectors/Onboarding', () => ({
    hasSeenTourSelector: () => true,
}));

const mockClearCopyPolicySettings = jest.mocked(clearCopyPolicySettings);
const mockRequestNotification = jest.mocked(requestCopyPolicySettingsNotification);
const mockSetCopyPolicySettingsData = jest.mocked(setCopyPolicySettingsData);
const mockNavigateToConcierge = jest.mocked(navigateToConciergeChat);

function renderModal() {
    return render(<CopyPolicySettingsProgressModal />);
}

describe('CopyPolicySettingsProgressModal', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        lastModalProps = undefined;
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        return Onyx.clear();
    });

    describe('visibility', () => {
        it('should not be visible when currentStep is null', async () => {
            await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: null});
            await waitForBatchedUpdates();

            renderModal();

            expect(lastModalProps?.isVisible).toBe(false);
        });

        it('should be visible when currentStep is loading', async () => {
            await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.LOADING});
            await waitForBatchedUpdates();

            renderModal();

            expect(lastModalProps?.isVisible).toBe(true);
        });

        it('should be visible when currentStep is complete', async () => {
            await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.COMPLETE});
            await waitForBatchedUpdates();

            renderModal();

            expect(lastModalProps?.isVisible).toBe(true);
        });
    });

    describe('loading state (initial)', () => {
        beforeEach(async () => {
            await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.LOADING});
            await waitForBatchedUpdates();
        });

        it('should show copy-in-progress title and description', () => {
            renderModal();

            expect(lastModalProps?.title).toBe('workspace.copyPolicySettings.progress.copyInProgressTitle');
            expect(lastModalProps?.prompt).toBe('workspace.copyPolicySettings.progress.copyInProgressDescription');
        });

        it('should show "let me know" as confirm text', () => {
            renderModal();

            expect(lastModalProps?.confirmText).toBe('workspace.copyPolicySettings.progress.letMeKnowPrompt');
        });

        it('should not show cancel button', () => {
            renderModal();

            expect(lastModalProps?.shouldShowCancelButton).toBe(false);
        });

        it('should call requestCopyPolicySettingsNotification on confirm', () => {
            renderModal();

            act(() => {
                lastModalProps?.onConfirm?.();
            });

            expect(mockRequestNotification).toHaveBeenCalledTimes(1);
        });
    });

    describe('loading state (after notification requested)', () => {
        beforeEach(async () => {
            await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.LOADING});
            await waitForBatchedUpdates();
        });

        it('should request notification and set currentStep to complete', () => {
            renderModal();

            act(() => {
                lastModalProps?.onConfirm?.();
            });

            expect(mockRequestNotification).toHaveBeenCalledTimes(1);
            expect(mockSetCopyPolicySettingsData).toHaveBeenCalledWith({currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.COMPLETE});
        });
    });

    describe('concierge notification state', () => {
        beforeEach(async () => {
            await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.COMPLETE});
            await waitForBatchedUpdates();
        });

        it('should show concierge notification title and description', () => {
            renderModal();

            expect(lastModalProps?.title).toBe('workspace.copyPolicySettings.progress.conciergeNotificationTitle');
            expect(lastModalProps?.prompt).toBe('workspace.copyPolicySettings.progress.conciergeNotificationDescription');
        });

        it('should show go-to-concierge as confirm and dismiss as cancel', () => {
            renderModal();

            expect(lastModalProps?.confirmText).toBe('common.goToConcierge');
            expect(lastModalProps?.cancelText).toBe('common.dismiss');
            expect(lastModalProps?.shouldShowCancelButton).toBe(true);
        });

        it('should clear state and navigate to concierge on confirm', () => {
            renderModal();

            act(() => {
                lastModalProps?.onConfirm?.();
            });

            expect(mockClearCopyPolicySettings).toHaveBeenCalledTimes(1);
            expect(mockNavigateToConcierge).toHaveBeenCalledTimes(1);
        });

        it('should clear state on cancel (dismiss)', () => {
            renderModal();

            act(() => {
                lastModalProps?.onCancel?.();
            });

            expect(mockClearCopyPolicySettings).toHaveBeenCalledTimes(1);
            expect(mockNavigateToConcierge).not.toHaveBeenCalled();
        });
    });

    describe('complete state', () => {
        beforeEach(async () => {
            await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.LOADING});
            await Onyx.merge(ONYXKEYS.NVP_BULK_POLICY_COPY_SETTINGS, {state: CONST.POLICY.COPY_SETTINGS_NVP_STATE.COMPLETE});
            await waitForBatchedUpdates();
        });

        it('should show all-set title and copy-completed description', () => {
            renderModal();

            expect(lastModalProps?.title).toBe('common.allSet');
            expect(lastModalProps?.prompt).toBe('workspace.copyPolicySettings.progress.copyCompleted');
        });

        it('should show done as confirm text without cancel button', () => {
            renderModal();

            expect(lastModalProps?.confirmText).toBe('common.done');
            expect(lastModalProps?.shouldShowCancelButton).toBe(false);
        });

        it('should clear state on confirm', () => {
            renderModal();

            act(() => {
                lastModalProps?.onConfirm?.();
            });

            expect(mockClearCopyPolicySettings).toHaveBeenCalledTimes(1);
        });

        it('should clear state on cancel (browser back)', () => {
            renderModal();

            act(() => {
                lastModalProps?.onCancel?.();
            });

            expect(mockClearCopyPolicySettings).toHaveBeenCalledTimes(1);
        });

        it('should handle browser back navigation when visible', () => {
            renderModal();

            expect(lastModalProps?.shouldHandleNavigationBack).toBe(true);
        });
    });
});
