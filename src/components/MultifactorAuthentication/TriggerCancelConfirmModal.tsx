import React from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import type {TranslationPaths} from '@src/languages/types';

type MultifactorAuthenticationTriggerCancelConfirmModalProps = {
    isVisible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

// TODO: this config will be part of the scenario configuration, the current implementation is for testing purposes (https://github.com/Expensify/App/issues/79373)
const mockedConfig = {
    title: 'common.areYouSure',
    description: 'multifactorAuthentication.biometricsTest.areYouSureToReject',
    confirmButtonText: 'multifactorAuthentication.biometricsTest.rejectAuthentication',
    cancelButtonText: 'common.cancel',
} as const satisfies Record<string, TranslationPaths>;

function MultifactorAuthenticationTriggerCancelConfirmModal({isVisible, onConfirm, onCancel}: MultifactorAuthenticationTriggerCancelConfirmModalProps) {
    const {translate} = useLocalize();

    const title = translate(mockedConfig.title);
    const description = translate(mockedConfig.description);
    const confirmButtonText = translate(mockedConfig.confirmButtonText);
    const cancelButtonText = translate(mockedConfig.cancelButtonText);

    return (
        <ConfirmModal
            danger
            title={title}
            onConfirm={onConfirm}
            onCancel={onCancel}
            isVisible={isVisible}
            prompt={description}
            confirmText={confirmButtonText}
            cancelText={cancelButtonText}
            shouldShowCancelButton
        />
    );
}

MultifactorAuthenticationTriggerCancelConfirmModal.displayName = 'MultifactorAuthenticationTriggerCancelConfirmModal';

export default MultifactorAuthenticationTriggerCancelConfirmModal;
