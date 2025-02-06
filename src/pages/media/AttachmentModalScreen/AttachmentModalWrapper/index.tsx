import React, {useCallback, useContext, useState} from 'react';
import Modal from '@components/Modal';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import Navigation from '@libs/Navigation/Navigation';
import AttachmentModalBaseContent from '@pages/media/AttachmentModalScreen/AttachmentModalContent/BaseContent';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import CONST from '@src/CONST';
import type {AttachmentModalWrapperProps} from './types';

function AttachmentModalWrapper({
    contentProps,
    wrapperProps: {modalType, closeConfirmModal, setShouldLoadAttachment, isOverlayModalVisible, onModalClose: onModalCloseProp},
    attachmentId,
}: AttachmentModalWrapperProps) {
    const [isModalOpen, setIsModalOpen] = useState(true);

    const onSubmitAndClose = useCallback(() => {
        setIsModalOpen(false);
    }, [setIsModalOpen]);

    /**
     *  open the modal
     */
    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, [setIsModalOpen]);

    /**
     * Closes the modal.
     * @param {boolean} [shouldCallDirectly] If true, directly calls `onModalClose`.
     * This is useful when you plan to continue navigating to another page after closing the modal, to avoid freezing the app due to navigating to another page first and dismissing the modal later.
     * If `shouldCallDirectly` is false or undefined, it calls `attachmentModalHandler.handleModalClose` to close the modal.
     * This ensures smooth modal closing behavior without causing delays in closing.
     */
    const closeModal = useCallback((shouldCallDirectly?: boolean) => {
        setIsModalOpen(false);

        // TODO: figure this out
        // if (typeof onModalClose === 'function') {
        //     if (shouldCallDirectly) {
        //         onModalClose();
        //         return;
        //     }
        //     attachmentModalHandler.handleModalClose(onModalClose);
        // }

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const attachmentsContext = useContext(AttachmentModalContext);
    const onModalClose = useCallback(() => {
        if (attachmentId) {
            attachmentsContext.removeAttachment(attachmentId);
        }
        Navigation.dismissModal();
        // This enables Composer refocus when the attachments modal is closed by the browser navigation
        ComposerFocusManager.setReadyToFocus();
    }, [attachmentId, attachmentsContext]);

    return (
        <Modal
            type={modalType ?? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
            onClose={isOverlayModalVisible ? () => closeConfirmModal?.() : () => closeModal?.()}
            isVisible={isModalOpen}
            onModalHide={() => {
                onModalClose();
                onModalCloseProp?.();
            }}
            onModalShow={() => {
                // onModalShow?.();
                setShouldLoadAttachment?.(true);
            }}
            propagateSwipe
            initialFocus={() => {
                if (!contentProps.submitRef?.current) {
                    return false;
                }
                return contentProps.submitRef.current;
            }}
        >
            <AttachmentModalBaseContent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...contentProps}
                closeModal={closeModal}
                closeConfirmModal={closeConfirmModal}
                isOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                openModal={openModal}
                onSubmitAndClose={onSubmitAndClose}
            />
        </Modal>
    );
}

AttachmentModalWrapper.displayName = 'AttachmentModalScreen';

export default AttachmentModalWrapper;
