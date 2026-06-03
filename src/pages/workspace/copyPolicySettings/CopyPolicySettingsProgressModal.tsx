import React from 'react';
import type {OnyxKey} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearCopyPolicySettings, requestCopyPolicySettingsNotification, setCopyPolicySettingsData} from '@libs/actions/Policy/CopyPolicySettings';
import {navigateToConciergeChat} from '@libs/actions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasSeenTourSelector} from '@src/selectors/Onboarding';
import type CopyPolicySettingsNVP from '@src/types/onyx/CopyPolicySettingsNVP';

function useCopyPolicySettingsProgressModal() {
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [copyPolicySettings] = useOnyx(ONYXKEYS.COPY_POLICY_SETTINGS);
    const [bulkPolicyCopySettings] = useOnyx<OnyxKey, CopyPolicySettingsNVP | null>(ONYXKEYS.NVP_BULK_POLICY_COPY_SETTINGS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});

    const copyInProgressStep = copyPolicySettings?.currentStep === 'loading';
    const requestNotificationStep = copyPolicySettings?.currentStep === 'complete';
    const isVisible = copyInProgressStep || requestNotificationStep;
    const isCopySettingsComplete = bulkPolicyCopySettings?.state === 'complete';

    // Show "All Set" when backend NVP reports complete AND user is still viewing the modal
    const shouldShowAllSet = isVisible && isCopySettingsComplete;

    if (shouldShowAllSet) {
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

    if (copyInProgressStep) {
        return {
            isVisible,
            title: translate('workspace.copyPolicySettings.progress.copyInProgressTitle'),
            prompt: translate('workspace.copyPolicySettings.progress.copyInProgressDescription'),
            confirmText: translate('workspace.copyPolicySettings.progress.letMeKnowPrompt'),
            cancelText: '',
            shouldShowCancelButton: false,
            onConfirm: () => {
                requestCopyPolicySettingsNotification();
                setCopyPolicySettingsData({currentStep: 'complete'});
            },
            onCancel: () => {},
        };
    }

    if (requestNotificationStep) {
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
