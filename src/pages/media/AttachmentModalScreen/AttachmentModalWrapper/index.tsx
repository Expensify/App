import React, {useCallback, useContext, useState} from 'react';
import Modal from '@components/Modal';
import attachmentModalHandler from '@libs/AttachmentModalHandler';
import AttachmentModalBaseContent from '@pages/media/AttachmentModalScreen/AttachmentModalContent/BaseContent';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import CONST from '@src/CONST';
import type {AttachmentModalWrapperProps} from './types';

function AttachmentModalWrapper({
    contentProps,
    wrapperProps: {modalType, closeConfirmModal, setShouldLoadAttachment, isOverlayModalVisible, onModalShow, onModalClose, onModalHide},
    attachmentId,
}: AttachmentModalWrapperProps) {
    const attachmentsContext = useContext(AttachmentModalContext);
    const [isModalOpen, setIsModalOpen] = useState(true);

    const onSubmitAndClose = useCallback(() => {
        setIsModalOpen(false);
    }, [setIsModalOpen]);

    /**
     * Closes the modal.
     * @param {boolean} [shouldCallDirectly] If true, directly calls `onModalClose`.
     * This is useful when you plan to continue navigating to another page after closing the modal, to avoid freezing the app due to navigating to another page first and dismissing the modal later.
     * If `shouldCallDirectly` is false or undefined, it calls `attachmentModalHandler.handleModalClose` to close the modal.
     * This ensures smooth modal closing behavior without causing delays in closing.
     */
    const closeModal = useCallback(
        (shouldCallDirectly?: boolean) => {
            setIsModalOpen(false);
            if (typeof onModalClose === 'function') {
                if (shouldCallDirectly) {
                    onModalClose();
                    return;
                }
                attachmentModalHandler.handleModalClose(onModalClose);
            }

            if (attachmentId) {
                attachmentsContext.removeAttachment(attachmentId);
            }
        },
        [attachmentId, attachmentsContext, onModalClose],
    );

    return (
        <Modal
            type={modalType ?? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
            onClose={isOverlayModalVisible ? () => closeConfirmModal?.() : () => closeModal?.()}
            isVisible={isModalOpen}
            onModalHide={onModalHide}
            onModalShow={() => {
                onModalShow?.();
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
                onSubmitAndClose={onSubmitAndClose}
            />
        </Modal>
    );
}

AttachmentModalWrapper.displayName = 'AttachmentModalWrapper';

export default AttachmentModalWrapper;
