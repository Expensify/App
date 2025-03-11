import React, {useCallback, useContext, useEffect} from 'react';
import Modal from '@components/Modal';
import attachmentModalHandler from '@libs/AttachmentModalHandler';
import Navigation from '@libs/Navigation/Navigation';
import AttachmentModalBaseContent from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import CONST from '@src/CONST';
import type AttachmentModalContainerProps from './types';

function AttachmentModalContainer({contentProps, modalType, closeConfirmModal, isOverlayModalVisible, onShow, onClose}: AttachmentModalContainerProps) {
    const attachmentsContext = useContext(AttachmentModalContext);

    /**
     * Closes the modal.
     * @param {boolean} [shouldCallDirectly] If true, directly calls `onModalClose`.
     * This is useful when you plan to continue navigating to another page after closing the modal, to avoid freezing the app due to navigating to another page first and dismissing the modal later.
     * If `shouldCallDirectly` is false or undefined, it calls `attachmentModalHandler.handleModalClose` to close the modal.
     * This ensures smooth modal closing behavior without causing delays in closing.
     */
    const closeModal = useCallback(
        (shouldCallDirectly?: boolean) => {
            if (typeof onClose === 'function') {
                if (shouldCallDirectly) {
                    onClose();
                } else {
                    attachmentModalHandler.handleModalClose(onClose);
                }
            }

            attachmentsContext.setCurrentAttachment(undefined);
            Navigation.goBack(contentProps.fallbackRoute);
        },
        [attachmentsContext, contentProps.fallbackRoute, onClose],
    );

    useEffect(() => {
        onShow?.();
    }, [onShow]);

    return (
        <Modal
            isVisible
            type={modalType ?? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
            onClose={isOverlayModalVisible ? () => closeConfirmModal?.() : () => closeModal?.()}
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
                onClose={closeModal}
                onConfirmModalClose={closeConfirmModal}
            />
        </Modal>
    );
}

AttachmentModalContainer.displayName = 'AttachmentModalContainer';

export default AttachmentModalContainer;
