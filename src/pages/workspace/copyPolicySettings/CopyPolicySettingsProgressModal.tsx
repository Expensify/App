import React from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearCopyPolicySettings, requestCopyPolicySettingsNotification, setCopyPolicySettingsData} from '@libs/actions/Policy/CopyPolicySettings';
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

    const notificationRequestedForStep = copyPolicySettings?.notificationRequestedForStep ?? null;
    const hasRequestedNotification = notificationRequestedForStep === currentStep;

    if (currentStep === 'loading' && !hasRequestedNotification) {
        return {
            isVisible,
            title: translate('workspace.copyPolicySettings.progress.copyInProgressTitle'),
            prompt: translate('workspace.copyPolicySettings.progress.copyInProgressDescription'),
            confirmText: translate('workspace.copyPolicySettings.progress.letMeKnowPrompt'),
            cancelText: '',
            shouldShowCancelButton: false,
            onConfirm: () => {
                requestCopyPolicySettingsNotification();
                setCopyPolicySettingsData({notificationRequestedForStep: currentStep ?? null});
            },
            onCancel: () => {},
        };
    }

    if (currentStep === 'loading' && hasRequestedNotification) {
        return {
            isVisible,
            title: translate('workspace.copyPolicySettings.progress.conciergeNotificationTitle'),
            prompt: translate('workspace.copyPolicySettings.progress.conciergeNotificationDescription'),
            confirmText: translate('common.goToConcierge'),
            cancelText: translate('common.dismiss'),
            shouldShowCancelButton: true,
            onConfirm: () => {
                clearCopyPolicySettings();
                navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas, false);
            },
            onCancel: () => {
                clearCopyPolicySettings();
            },
        };
    }

    if (currentStep === 'complete') {
        return {
            isVisible,
            title: translate('common.allSet'),
            prompt: translate('workspace.copyPolicySettings.progress.copyCompleted'),
            confirmText: translate('common.done'),
            cancelText: '',
            shouldShowCancelButton: false,
            onConfirm: () => {
                clearCopyPolicySettings();
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
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- The global useConfirmModal()/showConfirmModal() API is one-shot (its promise resolves on the first confirm/cancel and the modal unmounts). This progress modal must stay open across multiple Onyx state transitions ('loading' → notify-requested → 'complete') and update its content in place, which the global system does not support.
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
