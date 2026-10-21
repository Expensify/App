import type {FileDownloadModalProps} from '@components/Modal/FileDownloadModal';
import FileDownloadModal from '@components/Modal/FileDownloadModal';

import React, {useRef, useState} from 'react';

import type {ModalProps} from './ModalContext';

import {ModalActions} from './ModalContext';

type FileDownloadModalWrapperProps = ModalProps &
    Omit<FileDownloadModalProps, 'isVisible' | 'onClose' | 'onModalHide'> & {
        /** Called when the user dismisses the modal, before it starts hiding */
        onClose?: () => void;
    };

function FileDownloadModalWrapper({closeModal, onClose, ...props}: FileDownloadModalWrapperProps) {
    const [isVisible, setIsVisible] = useState(true);
    const hasClosedModalRef = useRef(false);

    const handleClose = () => {
        onClose?.();
        setIsVisible(false);
    };

    // Remove the modal from the stack only once it has finished hiding, so callers awaiting the show promise run
    // their cleanup after the modal is gone.
    const handleModalHide = () => {
        if (isVisible || hasClosedModalRef.current) {
            return;
        }
        hasClosedModalRef.current = true;
        closeModal({action: ModalActions.CLOSE});
    };

    return (
        <FileDownloadModal
            // Spreading is needed to forward the presentation props the caller passes through the global modal stack.

            {...props}
            isVisible={isVisible}
            onClose={handleClose}
            onModalHide={handleModalHide}
        />
    );
}

export default FileDownloadModalWrapper;
export type {FileDownloadModalWrapperProps};
