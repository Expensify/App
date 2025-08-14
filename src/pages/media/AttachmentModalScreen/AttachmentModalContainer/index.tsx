import React, {useCallback, useContext, useEffect, useState} from 'react';
import {InteractionManager} from 'react-native';
import Modal from '@components/Modal';
import Navigation from '@libs/Navigation/Navigation';
import type {OnCloseOptions} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentModalBaseContent from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import CONST from '@src/CONST';
import type AttachmentModalContainerProps from './types';

function AttachmentModalContainer({contentProps, modalType, onShow, onClose, shouldHandleNavigationBack}: AttachmentModalContainerProps) {
    const [isVisible, setIsVisible] = useState(true);
    const attachmentsContext = useContext(AttachmentModalContext);
    const [shouldDisableAnimationAfterInitialMount, setShouldDisableAnimationAfterInitialMount] = useState(false);

    /**
     * Closes the modal.
     * @param {boolean} [shouldCallDirectly] If true, directly calls `onModalClose`.
     * This is useful when you plan to continue navigating to another page after closing the modal, to avoid freezing the app due to navigating to another page first and dismissing the modal later.
     * If `shouldCallDirectly` is false or undefined, it calls `attachmentModalHandler.handleModalClose` to close the modal.
     * This ensures smooth modal closing behavior without causing delays in closing.
     */
    const closeModal = useCallback(
        (options?: OnCloseOptions) => {
            attachmentsContext.setCurrentAttachment(undefined);
            setIsVisible(false);

            onClose?.();
            Navigation.dismissModal();

            if (options?.onAfterClose) {
                options?.onAfterClose();
            }
        },
        [attachmentsContext, onClose],
    );

    // After the modal has initially been mounted and animated in,
    // we don't want to show another animation when the modal type changes or
    // when the browser switches to narrow layout.
    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            setShouldDisableAnimationAfterInitialMount(true);
        });
    }, []);

    useEffect(() => {
        onShow?.();
    }, [onShow]);

    return (
        <Modal
            disableAnimationIn={shouldDisableAnimationAfterInitialMount}
            isVisible={isVisible}
            type={modalType ?? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
            propagateSwipe
            initialFocus={() => {
                if (!contentProps.submitRef?.current) {
                    return false;
                }
                return contentProps.submitRef.current;
            }}
            shouldHandleNavigationBack={shouldHandleNavigationBack}
            onClose={closeModal}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <AttachmentModalBaseContent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...contentProps}
                shouldDisplayHelpButton={false}
                onClose={closeModal}
            />
        </Modal>
    );
}

AttachmentModalContainer.displayName = 'AttachmentModalContainer';

export default AttachmentModalContainer;
