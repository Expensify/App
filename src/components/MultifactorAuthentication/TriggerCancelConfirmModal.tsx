import React, {memo} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import type {MultifactorAuthenticationScenario} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';
import {MULTIFACTOR_AUTHENTICATION_MODAL_UI} from './config';

type MultifactorAuthenticationTriggerCancelConfirmModalProps = {
    isVisible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    scenario?: MultifactorAuthenticationScenario;
};

// TODO: MFA/Dev Remove this 'default' scenario
function MultifactorAuthenticationTriggerCancelConfirmModal({
    isVisible,
    onConfirm,
    onCancel,
    scenario = CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION,
}: MultifactorAuthenticationTriggerCancelConfirmModalProps) {
    const {translate} = useLocalize();

    const {title, description, cancelButtonText, confirmButtonText} = MULTIFACTOR_AUTHENTICATION_MODAL_UI[scenario].cancelConfirmation;

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

export default memo(MultifactorAuthenticationTriggerCancelConfirmModal);
