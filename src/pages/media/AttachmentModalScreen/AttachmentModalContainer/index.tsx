import React, {use, useEffect, useState} from 'react';
import {CenteredModal} from '@components/Modal/v2';
import type {SwipeDirection} from '@components/Modal/v2/compound/types';
import useLocalize from '@hooks/useLocalize';
import isHTMLElement from '@libs/isHTMLElement';
import Navigation from '@libs/Navigation/Navigation';
import AttachmentModalBaseContent from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent';
import AttachmentStateContextProvider from '@pages/media/AttachmentModalScreen/AttachmentModalBaseContent/AttachmentStateContextProvider';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import type {AttachmentModalScreenType} from '@pages/media/AttachmentModalScreen/types';
import CONST from '@src/CONST';
import type AttachmentModalContainerProps from './types';

const SWIPEABLE_DIRECTIONS: readonly SwipeDirection[] = [CONST.SWIPE_DIRECTION.DOWN, CONST.SWIPE_DIRECTION.RIGHT];

function AttachmentModalContainer<Screen extends AttachmentModalScreenType>({contentProps, modalType, onShow, onClose, ExtraContent}: AttachmentModalContainerProps<Screen>) {
    const [isVisible, setIsVisible] = useState(true);
    const attachmentsContext = use(AttachmentModalContext);
    const {translate} = useLocalize();
    const {submitRef, headerTitle} = contentProps;
    const resolveInitialFocus = () => {
        const node = submitRef?.current;
        return isHTMLElement(node) ? node : false;
    };

    const resetAttachmentModalAndClose = () => {
        attachmentsContext.setCurrentAttachment(undefined);
        setIsVisible(false);
        onClose?.();
    };

    const closeModal = () => {
        Navigation.dismissModal();
        resetAttachmentModalAndClose();
    };

    const handleOpenChange = (next: boolean) => {
        if (next) {
            return;
        }
        closeModal();
    };

    const swipeDirections = modalType === CONST.MODAL.MODAL_TYPE.CENTERED ? SWIPEABLE_DIRECTIONS : undefined;
    const accessibilityLabel = headerTitle ?? translate('common.attachment');

    useEffect(() => {
        onShow?.();

        return () => {
            resetAttachmentModalAndClose();
        };
    }, [resetAttachmentModalAndClose, onShow]);

    return (
        <>
            <CenteredModal.Root
                isOpen={isVisible}
                onOpenChange={handleOpenChange}
            >
                <CenteredModal.Content
                    escapeBehavior="dismiss"
                    swipeDirections={swipeDirections}
                    initialFocus={resolveInitialFocus}
                    accessibilityLabel={accessibilityLabel}
                >
                    <CenteredModal.EdgeToEdge />
                    <AttachmentStateContextProvider>
                        <AttachmentModalBaseContent
                            {...contentProps}
                            shouldDisplayHelpButton={false}
                            onClose={closeModal}
                        />
                    </AttachmentStateContextProvider>
                </CenteredModal.Content>
            </CenteredModal.Root>
            {ExtraContent}
        </>
    );
}

export default AttachmentModalContainer;
