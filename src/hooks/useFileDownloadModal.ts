import type {FileDownloadModalWrapperProps} from '@components/Modal/Global/FileDownloadModalWrapper';
import FileDownloadModalWrapper from '@components/Modal/Global/FileDownloadModalWrapper';
import type {ModalProps, ModalStateChangePayload} from '@components/Modal/Global/ModalContext';
import {useModal} from '@components/Modal/Global/ModalContext';

import {useEffect, useEffectEvent, useRef} from 'react';

type FileDownloadModalOptions = Omit<FileDownloadModalWrapperProps, keyof ModalProps> & {
    /**
     * Fixed id of the modal on the global stack. A show call with the same id updates the open modal in place instead
     * of stacking a new one, which keeps it reactive as the file generates.
     */
    id: string;
};

/**
 * Shows a file download modal on the global modal stack and keeps it in sync with the options passed on every render,
 * so callers only derive the status, copy, and download action for their file.
 *
 * The show promise resolves once the modal has finished hiding, with `CLOSE` if the user dismissed it while the file
 * was still generating and `CONFIRM` otherwise.
 */
const useFileDownloadModal = ({id, onDownload, title, status, message, shouldCloseOnDownload, shouldUseSuccessButton, shouldTreatModalAsCovering}: FileDownloadModalOptions) => {
    const context = useModal();

    // Whether the modal is on the stack. It turns false once the modal is gone, so a late update can't show it again: a
    // show call with the fixed id after the modal has closed pushes a new modal instead of updating it.
    const isOpenRef = useRef(false);

    // Resolves once the modal has finished hiding. Set from the first show call until then.
    const modalPromiseRef = useRef<Promise<ModalStateChangePayload> | undefined>(undefined);

    // Read through a ref so a download always uses the caller's latest data, without pushing the modal again every time
    // the caller re-renders with a new callback.
    const onDownloadRef = useRef(onDownload);
    useEffect(() => {
        onDownloadRef.current = onDownload;
    }, [onDownload]);

    const getModalProps = (): Omit<FileDownloadModalWrapperProps, keyof ModalProps> => ({
        title,
        status,
        message,
        shouldCloseOnDownload,
        shouldUseSuccessButton,
        shouldTreatModalAsCovering,
        onDownload: () => onDownloadRef.current(),
    });

    const updateOpenModal = useEffectEvent(() => {
        if (!isOpenRef.current) {
            return;
        }
        context.showModal({component: FileDownloadModalWrapper, id, props: getModalProps()});
    });

    // Push the latest state into the open modal so it stays reactive without remounting.
    useEffect(() => {
        updateOpenModal();
    }, [title, status, message, shouldCloseOnDownload, shouldUseSuccessButton, shouldTreatModalAsCovering]);

    const showFileDownloadModal = () => {
        // The modal is still on the stack (open or hiding), so the effect above updates it in place.
        if (modalPromiseRef.current) {
            return modalPromiseRef.current;
        }

        isOpenRef.current = true;
        const modalPromise = context.showModal({component: FileDownloadModalWrapper, id, props: getModalProps()}).then((result) => {
            isOpenRef.current = false;
            modalPromiseRef.current = undefined;
            return result;
        });
        modalPromiseRef.current = modalPromise;
        return modalPromise;
    };

    const closeFileDownloadModal = () => {
        isOpenRef.current = false;
        context.closeModalByID(id);
    };

    return {showFileDownloadModal, closeFileDownloadModal};
};

export default useFileDownloadModal;
