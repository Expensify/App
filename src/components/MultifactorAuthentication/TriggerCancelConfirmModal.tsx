import React from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import type {MultifactorAuthenticationScenario} from './config/types';
import {getMultifactorCancelConfirmModalConfig} from './helpers';

type MultifactorAuthenticationTriggerCancelConfirmModalProps = {
    isVisible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    scenario?: MultifactorAuthenticationScenario;
};

function MultifactorAuthenticationTriggerCancelConfirmModal({isVisible, onConfirm, onCancel, scenario}: MultifactorAuthenticationTriggerCancelConfirmModalProps) {
    const {translate} = useLocalize();

    const {title, description, cancelButtonText, confirmButtonText} = getMultifactorCancelConfirmModalConfig(scenario);

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
