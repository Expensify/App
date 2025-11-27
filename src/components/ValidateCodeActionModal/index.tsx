import React from 'react';
import Modal from '@components/Modal';
import CONST from '@src/CONST';
import type {ValidateCodeActionModalProps} from './type';
import ValidateCodeActionContent from './ValidateCodeActionContent';

function ValidateCodeActionModal({
    isVisible,
    title,
    descriptionPrimary,
    descriptionSecondary,
    onClose,
    validateError,
    validatePendingAction,
    validateCodeActionErrorField,
    handleSubmitForm,
    clearError,
    sendValidateCode,
    isLoading,
    shouldHandleNavigationBack,
    disableAnimation,
    threeDotsMenuItems = [],
    onThreeDotsButtonPress = () => {},
    onModalHide = () => {},
}: ValidateCodeActionModalProps) {
    return (
        <Modal
            shouldHandleNavigationBack={shouldHandleNavigationBack}
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={onClose}
            onBackdropPress={onClose}
            shouldUseModalPaddingStyle={false}
            animationInTiming={disableAnimation ? 1 : undefined}
            onModalHide={onModalHide}
            animationOutTiming={disableAnimation ? 1 : undefined}
        >
            <ValidateCodeActionContent
                title={title}
                descriptionPrimary={descriptionPrimary}
                descriptionSecondary={descriptionSecondary}
                validateCodeActionErrorField={validateCodeActionErrorField}
                handleSubmitForm={handleSubmitForm}
                clearError={clearError}
                onClose={onClose}
                sendValidateCode={sendValidateCode}
                validateError={validateError}
                validatePendingAction={validatePendingAction}
                threeDotsMenuItems={threeDotsMenuItems}
                onThreeDotsButtonPress={onThreeDotsButtonPress}
                isLoading={isLoading}
                isPageModal={false}
            />
        </Modal>
    );
}

ValidateCodeActionModal.displayName = 'ValidateCodeActionModal';

export default ValidateCodeActionModal;
