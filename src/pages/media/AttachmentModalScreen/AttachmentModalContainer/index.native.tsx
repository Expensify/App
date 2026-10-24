import ScreenWrapper from '@components/ScreenWrapper';

import attachmentModalHandler from '@libs/AttachmentModalHandler';
import Navigation from '@libs/Navigation/Navigation';

import AttachmentModalBaseContent from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentStateContextProvider from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/AttachmentStateContextProvider';
import type {AttachmentModalOnCloseOptions} from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/types';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import type {AttachmentModalScreenType} from '@pages/media/AttachmentModalScreen/types';

import {SafeString} from 'expensify-common';
import React, {useContext, useEffect} from 'react';

import type AttachmentModalContainerProps from './types';

function AttachmentModalContainer<Screen extends AttachmentModalScreenType>({contentProps, navigation, onShow, onClose}: AttachmentModalContainerProps<Screen>) {
    const attachmentsContext = useContext(AttachmentModalContext);
    const testID = typeof contentProps.source === 'string' ? contentProps.source : SafeString(contentProps.source);

    const resetAttachmentModalAndClose = () => {
        attachmentsContext.setCurrentAttachment(undefined);
        onClose?.();
    };

    /**
     * Closes the modal.
     * @param options Modal close options, including whether to call `onModalClose` directly.
     * This is useful when you plan to continue navigating to another page after closing the modal, to avoid freezing the app due to navigating to another page first and dismissing the modal later.
     * If `shouldCallDirectly` is false or undefined, it calls `attachmentModalHandler.handleModalClose` to close the modal.
     * This ensures smooth modal closing behavior without causing delays in closing.
     */
    const closeScreen = (options?: AttachmentModalOnCloseOptions) => {
        const close = () => {
            resetAttachmentModalAndClose();
            Navigation.goBack();
        };

        if (options?.shouldCallDirectly) {
            close();
        } else {
            attachmentModalHandler.handleModalClose(close);
        }
    };

    useEffect(() => {
        onShow?.();

        return () => {
            resetAttachmentModalAndClose?.();
        };
    }, [resetAttachmentModalAndClose, onShow]);

    return (
        <ScreenWrapper
            navigation={navigation}
            testID={`attachment-modal-${testID}`}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <AttachmentStateContextProvider>
                <AttachmentModalBaseContent
                    {...contentProps}
                    onClose={closeScreen}
                />
            </AttachmentStateContextProvider>
        </ScreenWrapper>
    );
}

export default AttachmentModalContainer;
