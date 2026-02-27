import React, {useCallback, useContext, useEffect, useState} from 'react';
import Modal from '@components/Modal';
import Navigation from '@libs/Navigation/Navigation';
import AttachmentModalBaseContent from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentStateContextProvider from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/AttachmentStateContextProvider';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import type {AttachmentModalScreenType} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import type AttachmentModalContainerProps from './types';

function AttachmentModalContainer<Screen extends AttachmentModalScreenType>({
    contentProps,
    modalType,
    onShow,
    onClose,
    shouldHandleNavigationBack,
    ExtraContent,
}: AttachmentModalContainerProps<Screen>) {
    const [isVisible, setIsVisible] = useState(true);
    const attachmentsContext = useContext(AttachmentModalContext);

    const resetAttachmentModalAndClose = useCallback(() => {
        attachmentsContext.setCurrentAttachment(undefined);
        setIsVisible(false);
        onClose?.();
    }, [attachmentsContext, onClose]);

    const closeModal = useCallback(() => {
        Navigation.dismissModal();
        resetAttachmentModalAndClose();
    }, [resetAttachmentModalAndClose]);

    useEffect(() => {
        onShow?.();

        return () => {
            resetAttachmentModalAndClose?.();
        };
    }, [resetAttachmentModalAndClose, onShow]);

    return (
        <>
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
            {ExtraContent}
        </>
    );
}

export default AttachmentModalContainer;
