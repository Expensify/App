import React from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import {MULTIFACTOR_AUTHENTICATION_DEFAULT_UI, MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from './config';
import type {MultifactorAuthenticationScenario} from './config/types';

type MultifactorAuthenticationTriggerCancelConfirmModalProps = {
    isVisible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    scenario?: MultifactorAuthenticationScenario;
};

function MultifactorAuthenticationTriggerCancelConfirmModal({isVisible, onConfirm, onCancel, scenario}: MultifactorAuthenticationTriggerCancelConfirmModalProps) {
    const {translate} = useLocalize();

    /**
     * Retrieves the cancel confirmation modal configuration for a given scenario.
     * Falls back to default UI configuration if scenario-specific config doesn't exist.
     */
    const {title, description, cancelButtonText, confirmButtonText} = (scenario ? MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario] : MULTIFACTOR_AUTHENTICATION_DEFAULT_UI).MODALS
        .cancelConfirmation;

    return (
        <ConfirmModal
            danger
            title={translate(title)}
            onConfirm={onConfirm}
            onCancel={onCancel}
            isVisible={isVisible}
            prompt={translate(description)}
            confirmText={translate(confirmButtonText)}
            cancelText={translate(cancelButtonText)}
            shouldShowCancelButton
        />
    );
}

MultifactorAuthenticationTriggerCancelConfirmModal.displayName = 'MultifactorAuthenticationTriggerCancelConfirmModal';

export default MultifactorAuthenticationTriggerCancelConfirmModal;
