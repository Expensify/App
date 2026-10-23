import type {FileDownloadModalProps} from '@components/Modal/FileDownloadModal';
import FileDownloadModal from '@components/Modal/FileDownloadModal';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React, {useRef, useState} from 'react';

import type {ModalProps} from './ModalContext';

import {ModalActions} from './ModalContext';

type FileDownloadModalWrapperProps = ModalProps & Omit<FileDownloadModalProps, 'isVisible' | 'onClose' | 'onModalHide'>;

function FileDownloadModalWrapper({closeModal, resolveModal, ...props}: FileDownloadModalWrapperProps) {
    const [isVisible, setIsVisible] = useState(true);

    // The props at the moment the user dismissed the modal. The props keep changing as the file generates until the
    // modal has finished hiding, so render these instead to keep a dismissed modal from changing while it fades out.
    const [dismissedProps, setDismissedProps] = useState<typeof props>();
    const closeActionRef = useRef<ValueOf<typeof ModalActions>>(ModalActions.CLOSE);
    const hasClosedModalRef = useRef(false);

    const handleClose = () => {
        if (!isVisible) {
            return;
        }

        // Dismissing while the file is still generating cancels the download. Once it is ready or has failed, the
        // flow has run its course.
        closeActionRef.current = props.status === CONST.FILE_DOWNLOAD_STATUS.GENERATING ? ModalActions.CLOSE : ModalActions.CONFIRM;
        setDismissedProps(props);
        setIsVisible(false);
    };

    // Remove the modal from the stack only once it has finished hiding, so callers awaiting the show promise run
    // their cleanup after the modal is gone.
    const handleModalHide = () => {
        if (isVisible || hasClosedModalRef.current) {
            return;
        }
        hasClosedModalRef.current = true;
        closeModal({action: closeActionRef.current});
    };

    return (
        <FileDownloadModal
            {...(dismissedProps ?? props)}
            isVisible={isVisible}
            onClose={handleClose}
            onModalHide={handleModalHide}
        />
    );
}

export default FileDownloadModalWrapper;
export type {FileDownloadModalWrapperProps};
