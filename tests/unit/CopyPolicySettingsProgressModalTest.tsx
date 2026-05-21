import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
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
    success?: boolean;
};

let lastModalProps: MockConfirmModalProps | undefined;

const mockClearCopyPolicySettings = jest.fn();
const mockRequestNotification = jest.fn();
const mockNavigateToConcierge = jest.fn();

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
    clearCopyPolicySettings: (...args: unknown[]) => mockClearCopyPolicySettings(...args),
    requestCopyPolicySettingsNotification: (...args: unknown[]) => mockRequestNotification(...args),
}));

jest.mock('@libs/actions/Report', () => ({
    navigateToConciergeChat: (...args: unknown[]) => mockNavigateToConcierge(...args),
}));

jest.mock('@src/selectors/Onboarding', () => ({
    hasSeenTourSelector: () => true,
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const CopyPolicySettingsProgressModal = require('@pages/workspace/copyPolicySettings/CopyPolicySettingsProgressModal').default;

function renderModal() {
    return render(<CopyPolicySettingsProgressModal />);
}

describe('CopyPolicySettingsProgressModal', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        lastModalProps = undefined;
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('visibility', () => {
        it('should not be visible when currentStep is null', async () => {
            await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: null});
            await waitForBatchedUpdates();

            renderModal();

            expect(lastModalProps?.isVisible).toBe(false);
        });

        it('should be visible when currentStep is loading', async () => {
            await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: 'loading'});
            await waitForBatchedUpdates();

            renderModal();

            expect(lastModalProps?.isVisible).toBe(true);
        });

        it('should be visible when currentStep is complete', async () => {
            await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: 'complete'});
            await waitForBatchedUpdates();

            renderModal();

            expect(lastModalProps?.isVisible).toBe(true);
        });
    });

    describe('loading state (initial)', () => {
        beforeEach(async () => {
            await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: 'loading'});
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
            await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: 'loading'});
            await waitForBatchedUpdates();
        });

        it('should show concierge notification title after requesting notification', () => {
            renderModal();

            act(() => {
                lastModalProps?.onConfirm?.();
            });

            expect(lastModalProps?.title).toBe('workspace.copyPolicySettings.progress.conciergeNotificationTitle');
            expect(lastModalProps?.prompt).toBe('workspace.copyPolicySettings.progress.conciergeNotificationDescription');
        });

        it('should show go-to-concierge as confirm and dismiss as cancel', () => {
            renderModal();

            act(() => {
                lastModalProps?.onConfirm?.();
            });

            expect(lastModalProps?.confirmText).toBe('common.goToConcierge');
            expect(lastModalProps?.cancelText).toBe('common.dismiss');
            expect(lastModalProps?.shouldShowCancelButton).toBe(true);
        });

        it('should clear state and navigate to concierge on confirm', () => {
            renderModal();

            act(() => {
                lastModalProps?.onConfirm?.();
            });

            act(() => {
                lastModalProps?.onConfirm?.();
            });

            expect(mockClearCopyPolicySettings).toHaveBeenCalledTimes(1);
            expect(mockNavigateToConcierge).toHaveBeenCalledTimes(1);
        });

        it('should clear state on cancel (dismiss)', () => {
            renderModal();

            act(() => {
                lastModalProps?.onConfirm?.();
            });

            act(() => {
                lastModalProps?.onCancel?.();
            });

            expect(mockClearCopyPolicySettings).toHaveBeenCalledTimes(1);
            expect(mockNavigateToConcierge).not.toHaveBeenCalled();
        });
    });

    describe('complete state', () => {
        beforeEach(async () => {
            await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: 'complete'});
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
    });

    describe('notification state reset on step change', () => {
        it('should reset notification state when currentStep changes from loading to complete', async () => {
            await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: 'loading'});
            await waitForBatchedUpdates();

            const {rerender} = renderModal();

            act(() => {
                lastModalProps?.onConfirm?.();
            });

            expect(lastModalProps?.title).toBe('workspace.copyPolicySettings.progress.conciergeNotificationTitle');

            await act(async () => {
                await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: 'complete'});
                await waitForBatchedUpdates();
            });

            rerender(<CopyPolicySettingsProgressModal />);

            expect(lastModalProps?.title).toBe('common.allSet');
        });
    });
});
