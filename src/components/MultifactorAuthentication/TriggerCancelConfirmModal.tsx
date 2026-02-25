import React from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import {MULTIFACTOR_AUTHENTICATION_DEFAULT_UI} from './config';
import type {MultifactorAuthenticationScenarioConfig} from './config/types';

type MultifactorAuthenticationTriggerCancelConfirmModalProps = {
    isVisible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    scenario?: MultifactorAuthenticationScenarioConfig;
};

function MultifactorAuthenticationTriggerCancelConfirmModal({isVisible, onConfirm, onCancel, scenario}: MultifactorAuthenticationTriggerCancelConfirmModalProps) {
    const {translate} = useLocalize();

    const defaults = MULTIFACTOR_AUTHENTICATION_DEFAULT_UI.MODALS.cancelConfirmation;
    const cancelConfirmation = scenario?.MODALS.cancelConfirmation;

    return (
        <ConfirmModal
            danger
            title={translate(cancelConfirmation?.title ?? defaults.title)}
            onConfirm={onConfirm}
            onCancel={onCancel}
            isVisible={isVisible}
            prompt={translate(cancelConfirmation?.description ?? defaults.description)}
            confirmText={translate(cancelConfirmation?.confirmButtonText ?? defaults.confirmButtonText)}
            cancelText={translate(cancelConfirmation?.cancelButtonText ?? defaults.cancelButtonText)}
            shouldShowCancelButton
        />
    );
}

MultifactorAuthenticationTriggerCancelConfirmModal.displayName = 'MultifactorAuthenticationTriggerCancelConfirmModal';

export default MultifactorAuthenticationTriggerCancelConfirmModal;
