import React, {useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearCopyPolicySettings, requestCopyPolicySettingsNotification} from '@libs/actions/Policy/CopyPolicySettings';
import {navigateToConciergeChat} from '@libs/actions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasSeenTourSelector} from '@src/selectors/Onboarding';

function useCopyPolicySettingsProgressModal() {
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [copyPolicySettings] = useOnyx(ONYXKEYS.COPY_POLICY_SETTINGS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});

    const currentStep = copyPolicySettings?.currentStep;
    const isVisible = currentStep === 'loading' || currentStep === 'complete';

    // Track which currentStep the notification was requested for.
    // Auto-resets when currentStep changes (e.g. hidden → loading again).
    const [notificationRequestedForStep, setNotificationRequestedForStep] = useState<string | null>(null);
    const hasRequestedNotification = notificationRequestedForStep === currentStep;

    if (currentStep === 'loading' && !hasRequestedNotification) {
        return {
            isVisible,
            title: translate('workspace.copyPolicySettings.copyInProgressTitle'),
            prompt: translate('workspace.copyPolicySettings.copyInProgressDescription'),
            confirmText: translate('workspace.copyPolicySettings.letMeKnowPrompt'),
            cancelText: '',
            shouldShowCancelButton: false,
            onConfirm: () => {
                requestCopyPolicySettingsNotification();
                setNotificationRequestedForStep(currentStep ?? null);
            },
            onCancel: () => {},
        };
    }

    if (currentStep === 'loading' && hasRequestedNotification) {
        return {
            isVisible,
            title: translate('workspace.copyPolicySettings.conciergeNotificationTitle'),
            prompt: translate('workspace.copyPolicySettings.conciergeNotificationDescription'),
            confirmText: translate('common.goToConcierge'),
            cancelText: translate('common.dismiss'),
            shouldShowCancelButton: true,
            onConfirm: () => {
                clearCopyPolicySettings();
                setNotificationRequestedForStep(null);
                navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas, false);
            },
            onCancel: () => {
                clearCopyPolicySettings();
                setNotificationRequestedForStep(null);
            },
        };
    }

    if (currentStep === 'complete') {
        return {
            isVisible,
            title: translate('common.allSet'),
            prompt: translate('workspace.copyPolicySettings.copyCompleted'),
            confirmText: translate('common.done'),
            cancelText: '',
            shouldShowCancelButton: false,
            onConfirm: () => {
                clearCopyPolicySettings();
                setNotificationRequestedForStep(null);
            },
            onCancel: () => {},
        };
    }

    return {
        isVisible: false,
        title: '',
        prompt: '',
        confirmText: '',
        cancelText: '',
        shouldShowCancelButton: false,
        onConfirm: () => {},
        onCancel: () => {},
    };
}

function CopyPolicySettingsProgressModal() {
    const {isVisible, title, prompt, confirmText, cancelText, shouldShowCancelButton, onConfirm, onCancel} = useCopyPolicySettingsProgressModal();

    return (
        <ConfirmModal
            title={title}
            isVisible={isVisible}
            onConfirm={onConfirm}
            onCancel={onCancel}
            prompt={prompt}
            confirmText={confirmText}
            cancelText={cancelText}
            shouldShowCancelButton={shouldShowCancelButton}
            success
        />
    );
}

CopyPolicySettingsProgressModal.displayName = 'CopyPolicySettingsProgressModal';

export default CopyPolicySettingsProgressModal;
