import React, {memo} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type {MultifactorAuthenticationScenario} from './config';
import {MULTIFACTOR_AUTHENTICATION_UI} from './config';

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

    const {title, description, cancelButtonText, confirmButtonText} = MULTIFACTOR_AUTHENTICATION_UI[scenario].MODALS.cancelConfirmation;

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
