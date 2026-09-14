import {act, render} from '@testing-library/react-native';

import {clearCopyPolicySettings, requestCopyPolicySettingsNotification, setCopyPolicySettingsData} from '@libs/actions/Policy/CopyPolicySettings';
import {navigateToConciergeChat} from '@libs/actions/Report';

import CopyPolicySettingsProgressModal from '@pages/workspace/copyPolicySettings/CopyPolicySettingsProgressModal';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {isValidElement} from 'react';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type MockConfirmModalProps = {
    isVisible?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    title?: string;
    prompt?: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    shouldShowCancelButton?: boolean;
    shouldHandleNavigationBack?: boolean;
    buttonVariant?: string;
};

let lastModalProps: MockConfirmModalProps | undefined;

function getBackendErrorFromPrompt(prompt: string | React.ReactNode | undefined): string | undefined {
    if (!isValidElement<{children: React.ReactNode}>(prompt)) {
        return undefined;
    }

    const renderHTML = prompt.props.children;
    if (isValidElement<{html: string}>(renderHTML)) {
        return renderHTML.props.html;
    }

    return undefined;
}

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

jest.mock('@components/RenderHTML', () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock('@libs/actions/Policy/CopyPolicySettings', () => ({
    clearCopyPolicySettings: jest.fn(),
    requestCopyPolicySettingsNotification: jest.fn(),
    setCopyPolicySettingsData: jest.fn(),
}));

jest.mock('@libs/actions/Report', () => ({
    navigateToConciergeChat: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: (route: string) => {
        mockNavigate(route);
    },
}));

jest.mock('@src/selectors/Onboarding', () => ({
    hasSeenTourSelector: () => true,
}));

const mockClearCopyPolicySettings = jest.mocked(clearCopyPolicySettings);
const mockRequestNotification = jest.mocked(requestCopyPolicySettingsNotification);
const mockSetCopyPolicySettingsData = jest.mocked(setCopyPolicySettingsData);
const mockNavigateToConcierge = jest.mocked(navigateToConciergeChat);

async function setOnyxState(setter: () => Promise<void>) {
    await act(async () => {
        await setter();
        await waitForBatchedUpdatesWithAct();
    });
}

async function renderModal() {
    render(<CopyPolicySettingsProgressModal />);
    await waitForBatchedUpdatesWithAct();
}

/**
 * Renders the modal while leaving pending timers alone. Under fake timers `waitForBatchedUpdatesWithAct`
 * calls `jest.runOnlyPendingTimers()`, which would fire the progress timeout during setup and make the
 * deadline untestable. Onyx notifies its subscribers on `process.nextTick`, which jest never fakes, so
 * flushing that alone is enough for the first render to read the state set beforehand.
 */
async function renderModalWithoutRunningTimers() {
    render(<CopyPolicySettingsProgressModal />);
    await act(async () => {
        await new Promise<void>((resolve) => {
            process.nextTick(resolve);
        });
    });
}

describe('CopyPolicySettingsProgressModal', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        lastModalProps = undefined;
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('visibility', () => {
        it('should not be visible when currentStep is null', async () => {
            await setOnyxState(async () => {
                await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: null});
            });

            await renderModal();

            expect(lastModalProps?.isVisible).toBe(false);
        });

        it('should be visible when currentStep is loading', async () => {
            await setOnyxState(async () => {
                await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.LOADING});
            });

            await renderModal();

            expect(lastModalProps?.isVisible).toBe(true);
        });

        it('should be visible when currentStep is complete', async () => {
            await setOnyxState(async () => {
                await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.COMPLETE});
            });

            await renderModal();

            expect(lastModalProps?.isVisible).toBe(true);
        });
    });

    describe('loading state (initial)', () => {
        beforeEach(async () => {
            await setOnyxState(async () => {
                await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.LOADING});
            });
        });

        it('should show copy-in-progress title and description', async () => {
            await renderModal();

            expect(lastModalProps?.title).toBe('workspace.copyPolicySettings.progress.copyInProgressTitle');
            expect(lastModalProps?.prompt).toBe('workspace.copyPolicySettings.progress.copyInProgressDescription');
        });

        it('should show "let me know" as confirm text', async () => {
            await renderModal();

            expect(lastModalProps?.confirmText).toBe('workspace.copyPolicySettings.progress.letMeKnowPrompt');
        });

        it('should not show cancel button', async () => {
            await renderModal();

            expect(lastModalProps?.shouldShowCancelButton).toBe(false);
        });

        it('should call requestCopyPolicySettingsNotification on confirm', async () => {
            await renderModal();

            act(() => {
                lastModalProps?.onConfirm?.();
            });

            expect(mockRequestNotification).toHaveBeenCalledTimes(1);
        });
    });

    describe('loading state (after notification requested)', () => {
        beforeEach(async () => {
            await setOnyxState(async () => {
                await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.LOADING});
            });
        });

        it('should request notification and set currentStep to complete', async () => {
            await renderModal();

            act(() => {
                lastModalProps?.onConfirm?.();
            });

            expect(mockRequestNotification).toHaveBeenCalledTimes(1);
            expect(mockSetCopyPolicySettingsData).toHaveBeenCalledWith({currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.COMPLETE});
        });
    });

    describe('concierge notification state', () => {
        beforeEach(async () => {
            await setOnyxState(async () => {
                await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.COMPLETE});
            });
        });

        it('should show concierge notification title and description', async () => {
            await renderModal();

            expect(lastModalProps?.title).toBe('workspace.copyPolicySettings.progress.conciergeNotificationTitle');
            expect(lastModalProps?.prompt).toBe('workspace.copyPolicySettings.progress.conciergeNotificationDescription');
        });

        it('should show go-to-concierge as confirm and dismiss as cancel', async () => {
            await renderModal();

            expect(lastModalProps?.confirmText).toBe('common.goToConcierge');
            expect(lastModalProps?.cancelText).toBe('common.dismiss');
            expect(lastModalProps?.shouldShowCancelButton).toBe(true);
        });

        it('should clear state and navigate to concierge on confirm', async () => {
            await renderModal();

            act(() => {
                lastModalProps?.onConfirm?.();
            });

            expect(mockClearCopyPolicySettings).toHaveBeenCalledTimes(1);
            expect(mockNavigateToConcierge).toHaveBeenCalledTimes(1);
        });

        it('should clear state on cancel (dismiss)', async () => {
            await renderModal();

            act(() => {
                lastModalProps?.onCancel?.();
            });

            expect(mockClearCopyPolicySettings).toHaveBeenCalledTimes(1);
            expect(mockNavigateToConcierge).not.toHaveBeenCalled();
        });
    });

    describe('complete state', () => {
        beforeEach(async () => {
            await setOnyxState(async () => {
                await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.LOADING});
                await Onyx.merge(ONYXKEYS.NVP_BULK_POLICY_COPY_SETTINGS, {state: CONST.POLICY.COPY_SETTINGS_NVP_STATE.COMPLETE});
            });
        });

        it('should show all-set title and copy-completed description', async () => {
            await renderModal();

            expect(lastModalProps?.title).toBe('common.allSet');
            expect(lastModalProps?.prompt).toBe('workspace.copyPolicySettings.progress.copyCompleted');
        });

        it('should show done as confirm text without cancel button', async () => {
            await renderModal();

            expect(lastModalProps?.confirmText).toBe('common.done');
            expect(lastModalProps?.shouldShowCancelButton).toBe(false);
        });

        it('should clear state on confirm', async () => {
            await renderModal();

            act(() => {
                lastModalProps?.onConfirm?.();
            });

            expect(mockClearCopyPolicySettings).toHaveBeenCalledTimes(1);
        });

        it('should clear state on cancel (browser back)', async () => {
            await renderModal();

            act(() => {
                lastModalProps?.onCancel?.();
            });

            expect(mockClearCopyPolicySettings).toHaveBeenCalledTimes(1);
        });

        it('should handle browser back navigation when visible', async () => {
            await renderModal();

            expect(lastModalProps?.shouldHandleNavigationBack).toBe(true);
        });
    });

    describe('progress timeout', () => {
        afterEach(() => {
            jest.useRealTimers();
        });

        /**
         * Seeds an in-flight copy that started `elapsedTime` ago and renders the modal. The clock is faked
         * up front so `startedAt` and the modal's deadline are measured against the same frozen `Date.now()`,
         * leaving `setImmediate`/`nextTick` real so the Onyx and render flushes still settle on their own.
         */
        async function startCopyStartedAgo(elapsedTime: number, nvpState?: ValueOf<typeof CONST.POLICY.COPY_SETTINGS_NVP_STATE>) {
            jest.useFakeTimers({doNotFake: ['nextTick', 'setImmediate', 'clearImmediate']});
            await setOnyxState(async () => {
                await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.LOADING, startedAt: Date.now() - elapsedTime});
                if (nvpState) {
                    await Onyx.merge(ONYXKEYS.NVP_BULK_POLICY_COPY_SETTINGS, {state: nvpState});
                }
            });
            await renderModalWithoutRunningTimers();
        }

        it('should keep spinning until the timeout elapses', async () => {
            await startCopyStartedAgo(0);

            act(() => {
                jest.advanceTimersByTime(CONST.POLICY.COPY_SETTINGS_PROGRESS_TIMEOUT_MS - 1);
            });

            expect(mockRequestNotification).not.toHaveBeenCalled();
            expect(lastModalProps?.title).toBe('workspace.copyPolicySettings.progress.copyInProgressTitle');
        });

        it('should fall back to the concierge notification step when the backend never reports a terminal state', async () => {
            await startCopyStartedAgo(0);

            act(() => {
                jest.advanceTimersByTime(CONST.POLICY.COPY_SETTINGS_PROGRESS_TIMEOUT_MS);
            });

            expect(mockRequestNotification).toHaveBeenCalledTimes(1);
            expect(mockSetCopyPolicySettingsData).toHaveBeenCalledWith({currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.COMPLETE});
        });

        it('should count time already elapsed so remounting does not restart the deadline', async () => {
            await startCopyStartedAgo(CONST.POLICY.COPY_SETTINGS_PROGRESS_TIMEOUT_MS - 5000);

            act(() => {
                jest.advanceTimersByTime(5000);
            });

            expect(mockRequestNotification).toHaveBeenCalledTimes(1);
        });

        it('should not time out once the backend reports the copy is complete', async () => {
            await startCopyStartedAgo(0, CONST.POLICY.COPY_SETTINGS_NVP_STATE.COMPLETE);

            act(() => {
                jest.advanceTimersByTime(CONST.POLICY.COPY_SETTINGS_PROGRESS_TIMEOUT_MS * 2);
            });

            expect(mockRequestNotification).not.toHaveBeenCalled();
            expect(mockSetCopyPolicySettingsData).not.toHaveBeenCalled();
        });

        it('should not time out once the backend reports the copy has failed', async () => {
            await startCopyStartedAgo(0, CONST.POLICY.COPY_SETTINGS_NVP_STATE.FAILED);

            act(() => {
                jest.advanceTimersByTime(CONST.POLICY.COPY_SETTINGS_PROGRESS_TIMEOUT_MS * 2);
            });

            expect(mockRequestNotification).not.toHaveBeenCalled();
        });
    });

    describe('failure state', () => {
        const sourcePolicyID = 'test-policy-123';

        beforeEach(async () => {
            await setOnyxState(async () => {
                await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {
                    currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.LOADING,
                    sourcePolicyID,
                });
                await Onyx.merge(ONYXKEYS.NVP_BULK_POLICY_COPY_SETTINGS, {state: CONST.POLICY.COPY_SETTINGS_NVP_STATE.FAILED});
            });
        });

        it('should be visible when in loading state and backend reports failed', async () => {
            await renderModal();

            expect(lastModalProps?.isVisible).toBe(true);
        });

        it('should show failed title', async () => {
            await renderModal();

            expect(lastModalProps?.title).toBe('workspace.copyPolicySettings.progress.copyFailedTitle');
        });

        it('should show default error message when backend error is not provided', async () => {
            await renderModal();

            expect(lastModalProps?.prompt).toBe('workspace.copyPolicySettings.error');
        });

        it('should show backend error message when provided', async () => {
            const backendError = 'Something went wrong on the server';
            await setOnyxState(async () => {
                await Onyx.merge(ONYXKEYS.NVP_BULK_POLICY_COPY_SETTINGS, {
                    state: CONST.POLICY.COPY_SETTINGS_NVP_STATE.FAILED,
                    error: backendError,
                });
            });

            await renderModal();

            expect(getBackendErrorFromPrompt(lastModalProps?.prompt)).toBe(backendError);
        });

        it('should show try again as confirm and dismiss as cancel', async () => {
            await renderModal();

            expect(lastModalProps?.confirmText).toBe('common.tryAgain');
            expect(lastModalProps?.cancelText).toBe('common.dismiss');
            expect(lastModalProps?.shouldShowCancelButton).toBe(true);
        });

        it('should show danger styling', async () => {
            await renderModal();

            expect(lastModalProps?.buttonVariant).toBe(CONST.BUTTON_VARIANT.DANGER);
        });

        it('should clear state and navigate to copy settings flow on confirm (try again)', async () => {
            await renderModal();

            act(() => {
                lastModalProps?.onConfirm?.();
            });

            expect(mockClearCopyPolicySettings).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledTimes(1);
        });

        it('should clear state without navigation on cancel (dismiss)', async () => {
            await renderModal();

            act(() => {
                lastModalProps?.onCancel?.();
            });

            expect(mockClearCopyPolicySettings).toHaveBeenCalledTimes(1);
            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should not navigate when sourcePolicyID is not available', async () => {
            await setOnyxState(async () => {
                await Onyx.clear();
                await Onyx.merge(ONYXKEYS.COPY_POLICY_SETTINGS, {
                    currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.LOADING,
                });
                await Onyx.merge(ONYXKEYS.NVP_BULK_POLICY_COPY_SETTINGS, {state: CONST.POLICY.COPY_SETTINGS_NVP_STATE.FAILED});
            });

            await renderModal();

            act(() => {
                lastModalProps?.onConfirm?.();
            });

            expect(mockClearCopyPolicySettings).toHaveBeenCalledTimes(1);
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});
