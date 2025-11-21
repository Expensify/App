import React, {memo} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import {MULTIFACTOR_AUTHENTICATION_MODAL_UI} from '@components/MultifactorAuthenticationContext/ui';
import useLocalize from '@hooks/useLocalize';
import type {MultifactorAuthenticationScenario} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';

type MFATriggerCancelConfirmModalProps = {
    isVisible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    scenario?: MultifactorAuthenticationScenario;
};

// TODO: Remove this 'default' scenario
function MFATriggerCancelConfirmModal({isVisible, onConfirm, onCancel, scenario = CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION}: MFATriggerCancelConfirmModalProps) {
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

MFATriggerCancelConfirmModal.displayName = 'MFATriggerCancelConfirmModal';

export default memo(MFATriggerCancelConfirmModal);
