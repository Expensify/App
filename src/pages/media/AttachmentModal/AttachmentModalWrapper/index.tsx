import {Str} from 'expensify-common';
import React, {useCallback, useState} from 'react';
import type {FileObject} from '@components/AttachmentModal';
import Modal from '@components/Modal';
import {translateLocal} from '@libs/Localize';
import AttachmentModalContent from '@pages/media/AttachmentModal/AttachmentModalContent';
import type {AttachmentModalScreenProps} from '@pages/media/AttachmentModal/types';
import useAttachmentModalLogic from '@pages/media/AttachmentModal/useAttachmentModalLogic';
import CONST from '@src/CONST';
import type ModalType from '@src/types/utils/ModalType';

function AttachmentModalScreen({route, onModalShow, onModalHide}: AttachmentModalScreenProps) {
    const {
        contentProps,
        isOverlayModalVisible,
        setIsAttachmentInvalid,
        shouldLoadAttachment,
        setShouldLoadAttachment,
        isModalOpen,
        setIsModalOpen,
        isPDFLoadError,
        attachmentInvalidReasonTitle,
        setAttachmentInvalidReasonTitle,
        attachmentInvalidReason,
        setAttachmentInvalidReason,
        submitRef,

        closeConfirmModal,
        closeModal,
    } = useAttachmentModalLogic(route);

    const onSubmitAndClose = useCallback(() => {
        setIsModalOpen(false);
    }, [setIsModalOpen]);

    const onPdfLoadError = useCallback(() => {
        // eslint-disable-next-line react-compiler/react-compiler
        isPDFLoadError.current = true;
        setIsModalOpen(false);
    }, [isPDFLoadError, setIsModalOpen]);

    const onInvalidReasonModalHide = useCallback(() => {
        if (!isPDFLoadError.current) {
            return;
        }
        isPDFLoadError.current = false;
        onModalHide?.();
    }, [isPDFLoadError, onModalHide]);

    /**
     * If our attachment is a PDF, return the unswipeablge Modal type.
     */
    const getModalType = useCallback(
        (sourceURL: string, fileObject: FileObject) =>
            sourceURL && (Str.isPDF(sourceURL) || (fileObject && Str.isPDF(fileObject.name ?? translateLocal('attachmentView.unknownFilename'))))
                ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
                : CONST.MODAL.MODAL_TYPE.CENTERED,
        [],
    );

    const [modalType, setModalType] = useState<ModalType>(CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE);

    const onUploadFileValidated = useCallback(
        (type: string, sourceURL: string, fileObject: FileObject) => {
            if (type === 'file') {
                const inputModalType = getModalType(sourceURL, fileObject);
                setModalType(inputModalType);
            } else if (type === 'uri') {
                const inputModalType = getModalType(sourceURL, fileObject);
                setModalType(inputModalType);
            }
        },
        [getModalType],
    );

    /**
     *  open the modal
     */
    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, [setIsModalOpen]);

    return (
        <Modal
            type={modalType}
            onClose={isOverlayModalVisible ? closeConfirmModal : closeModal}
            isVisible={isModalOpen}
            onModalShow={() => {
                onModalShow?.();
                setShouldLoadAttachment(true);
            }}
            onModalHide={() => {
                if (!isPDFLoadError.current) {
                    onModalHide?.();
                }
                setShouldLoadAttachment(false);
                if (isPDFLoadError.current) {
                    setIsAttachmentInvalid(true);
                    setAttachmentInvalidReasonTitle('attachmentPicker.attachmentError');
                    setAttachmentInvalidReason('attachmentPicker.errorWhileSelectingCorruptedAttachment');
                }
            }}
            propagateSwipe
            initialFocus={() => {
                if (!submitRef.current) {
                    return false;
                }
                return submitRef.current;
            }}
        >
            <AttachmentModalContent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...contentProps}
                shouldLoadAttachment={shouldLoadAttachment}
                isOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                attachmentInvalidReasonTitle={attachmentInvalidReasonTitle}
                attachmentInvalidReason={attachmentInvalidReason}
                submitRef={submitRef}
                closeConfirmModal={closeConfirmModal}
                openModal={openModal}
                onSubmitAndClose={onSubmitAndClose}
                onPdfLoadError={onPdfLoadError}
                onInvalidReasonModalHide={onInvalidReasonModalHide}
                onUploadFileValidated={onUploadFileValidated}
            />
        </Modal>
    );
}

AttachmentModalScreen.displayName = 'AttachmentModalScreen';

export default AttachmentModalScreen;
