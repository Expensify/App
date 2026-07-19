import ConfirmModal from '@components/ConfirmModal';
import RenderHTML from '@components/RenderHTML';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearCopyPolicySettings, requestCopyPolicySettingsNotification, setCopyPolicySettingsData} from '@libs/actions/Policy/CopyPolicySettings';
import {navigateToConciergeChat} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {hasSeenTourSelector} from '@src/selectors/Onboarding';

import React from 'react';
import {View} from 'react-native';

function useCopyPolicySettingsProgressModal() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [copyPolicySettings] = useOnyx(ONYXKEYS.COPY_POLICY_SETTINGS);
    const [bulkPolicyCopySettings] = useOnyx(ONYXKEYS.NVP_BULK_POLICY_COPY_SETTINGS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});

    const copyInProgressStep = copyPolicySettings?.currentStep === CONST.POLICY.COPY_SETTINGS_MODAL_STEP.LOADING;
    const requestNotificationStep = copyPolicySettings?.currentStep === CONST.POLICY.COPY_SETTINGS_MODAL_STEP.COMPLETE;
    const isCopySettingsComplete = bulkPolicyCopySettings?.state === CONST.POLICY.COPY_SETTINGS_NVP_STATE.COMPLETE;
    const isCopySettingsFailed = bulkPolicyCopySettings?.state === CONST.POLICY.COPY_SETTINGS_NVP_STATE.FAILED;
    const backendErrorMessage = bulkPolicyCopySettings?.error;

    // Modal is visible when in progress, when user requested notification, or when failed (while modal is still open)
    const isVisible = copyInProgressStep || requestNotificationStep;

    // Show failure state when on the loading step AND backend reports failed.
    // User can either try again or dismiss.
    const shouldShowFailure = copyInProgressStep && isCopySettingsFailed;

    // Show "All Set" only when on the loading step AND backend reports complete.
    // If user already requested Concierge notification (requestNotificationStep), they should stay on that screen since they explicitly chose to be notified rather than wait.
    const shouldShowAllSet = copyInProgressStep && isCopySettingsComplete;

    if (shouldShowFailure) {
        const prompt = backendErrorMessage ? (
            <View style={[styles.renderHTML, styles.flexRow]}>
                <RenderHTML html={backendErrorMessage} />
            </View>
        ) : (
            translate('workspace.copyPolicySettings.error')
        );
        return {
            isVisible,
            title: translate('workspace.copyPolicySettings.progress.copyFailedTitle'),
            prompt,
            confirmText: translate('common.tryAgain'),
            cancelText: translate('common.dismiss'),
            shouldShowCancelButton: true,
            danger: true,
            onConfirm: () => {
                // Navigate back to the copy settings flow to retry
                clearCopyPolicySettings();
                const sourcePolicyID = copyPolicySettings?.sourcePolicyID;
                if (sourcePolicyID) {
                    Navigation.navigate(ROUTES.POLICY_COPY_SETTINGS.getRoute(sourcePolicyID));
                }
            },
            onCancel: () => {
                clearCopyPolicySettings();
            },
        };
    }

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
            onCancel: () => {
                clearCopyPolicySettings();
            },
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
            isTitleLoading: true,
            onConfirm: () => {
                requestCopyPolicySettingsNotification();
                setCopyPolicySettingsData({currentStep: CONST.POLICY.COPY_SETTINGS_MODAL_STEP.COMPLETE});
            },
            onCancel: () => {
                requestCopyPolicySettingsNotification(true);
                clearCopyPolicySettings();
            },
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
    const {isVisible, title, prompt, confirmText, cancelText, shouldShowCancelButton, isTitleLoading, danger, onConfirm, onCancel} = useCopyPolicySettingsProgressModal();

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
            isTitleLoading={isTitleLoading}
            shouldHandleNavigationBack
            success={!danger}
            danger={danger}
        />
    );
}

CopyPolicySettingsProgressModal.displayName = 'CopyPolicySettingsProgressModal';

export default CopyPolicySettingsProgressModal;
