import React from 'react';
import ConfirmModal from '@components/ConfirmModal';
import type {MultifactorAuthenticationCancelConfirm} from '@components/MultifactorAuthentication/config/types';
import useLocalize from '@hooks/useLocalize';

type BaseProps = Required<MultifactorAuthenticationCancelConfirm>;

type CancelConfirmModalProps = {
    isVisible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

type CancelConfirmModalBaseProps = CancelConfirmModalProps & BaseProps;

function CancelConfirmModalBase({isVisible, onConfirm, onCancel, title, description, confirmButtonText, cancelButtonText}: CancelConfirmModalBaseProps) {
    const {translate} = useLocalize();

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

CancelConfirmModalBase.displayName = 'CancelConfirmModalBase';

function createCancelConfirmModal(displayName: string, baseProps: BaseProps): (props: CancelConfirmModalProps) => React.ReactElement<CancelConfirmModalProps> {
    function CancelConfirmModal(mutableProps: CancelConfirmModalProps) {
        const props = {...baseProps, ...mutableProps};

        return (
            <CancelConfirmModalBase
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        );
    }

    CancelConfirmModal.displayName = displayName;

    return CancelConfirmModal;
}

export default createCancelConfirmModal;
export type {CancelConfirmModalProps};
