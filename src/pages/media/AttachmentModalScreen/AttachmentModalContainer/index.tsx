import React, {useCallback, useContext, useEffect, useState} from 'react';
import Modal from '@components/Modal';
import Navigation from '@libs/Navigation/Navigation';
import AttachmentModalBaseContent from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentStateContextProvider from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/AttachmentStateContextProvider';
import type {AttachmentModalOnCloseOptions} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import type {AttachmentModalScreenType} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import type AttachmentModalContainerProps from './types';

function AttachmentModalContainer<Screen extends AttachmentModalScreenType>({contentProps, modalType, onShow, onClose, shouldHandleNavigationBack}: AttachmentModalContainerProps<Screen>) {
    const [isVisible, setIsVisible] = useState(true);
    const attachmentsContext = useContext(AttachmentModalContext);

    /**
     * Closes the modal.
     * @param {boolean} [shouldCallDirectly] If true, directly calls `onModalClose`.
     * This is useful when you plan to continue navigating to another page after closing the modal, to avoid freezing the app due to navigating to another page first and dismissing the modal later.
     * If `shouldCallDirectly` is false or undefined, it calls `attachmentModalHandler.handleModalClose` to close the modal.
     * This ensures smooth modal closing behavior without causing delays in closing.
     */
    const closeModal = useCallback(
        (options?: AttachmentModalOnCloseOptions) => {
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

    useEffect(() => {
        onShow?.();
    }, [onShow]);

    return (
        <Modal
            isVisible={isVisible}
            type={modalType ?? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
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
            <AttachmentStateContextProvider>
                <AttachmentModalBaseContent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...contentProps}
                    shouldDisplayHelpButton={false}
                    onClose={closeModal}
                />
            </AttachmentStateContextProvider>
        </Modal>
    );
}

AttachmentModalContainer.displayName = 'AttachmentModalContainer';

export default AttachmentModalContainer;
