import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import type {View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Animated, {FadeIn, LayoutAnimationConfig} from 'react-native-reanimated';
import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {cleanFileName} from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';
import type ModalType from '@src/types/utils/ModalType';
import viewRef from '@src/types/utils/viewRef';
import AttachmentCarouselView from './Attachments/AttachmentCarousel/AttachmentCarouselView';
import useCarouselArrows from './Attachments/AttachmentCarousel/useCarouselArrows';
import useAttachmentErrors from './Attachments/AttachmentView/useAttachmentErrors';
import type {Attachment} from './Attachments/types';
import Button from './Button';
import HeaderGap from './HeaderGap';
import HeaderWithBackButton from './HeaderWithBackButton';
import Modal from './Modal';
import SafeAreaConsumer from './SafeAreaConsumer';

type ImagePickerResponse = {
    height?: number;
    name: string;
    size?: number | null;
    type: string;
    uri: string;
    width?: number;
};

type FileObject = Partial<File | ImagePickerResponse>;

type ChildrenProps = {
    displayFilesInModal: (data: FileObject[], items?: DataTransferItem[]) => void;
    show: () => void;
};

type AttachmentComposerModalProps = {
    /** Optional callback to fire when we want to preview an image and approve it for use. */
    onConfirm: ((file: FileObject | FileObject[]) => void) | null;

    /** Title shown in the header of the modal */
    headerTitle: string;

    /** Optional callback to fire when we want to do something after modal show. */
    onModalShow: () => void;

    /** Optional callback to fire when we want to do something after modal hide. */
    onModalHide: () => void;

    /** A function as a child to pass modal launching methods to */
    children: React.FC<ChildrenProps>;

    /** Should disable send button */
    shouldDisableSendButton: boolean;
};

function AttachmentComposerModal({onConfirm, onModalShow = () => {}, onModalHide = () => {}, headerTitle, children, shouldDisableSendButton = false}: AttachmentComposerModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {setAttachmentError, clearAttachmentErrors} = useAttachmentErrors();
    const {shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows} = useCarouselArrows();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType>(CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE);
    const [validFilesToUpload, setValidFilesToUpload] = useState<FileObject[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [page, setPage] = useState<number>(0);
    const [currentAttachment, setCurrentAttachment] = useState<Attachment | null>(null);

    /**
     * If our attachment is a PDF, return the unswipeable Modal type.
     */
    const getModalType = useCallback(
        (sourceURL: string, fileObject: FileObject) => {
            const fileName = fileObject?.name ?? translate('attachmentView.unknownFilename');
            return sourceURL && (sourceURL.includes('.pdf') || fileName.includes('.pdf')) ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE : CONST.MODAL.MODAL_TYPE.CENTERED;
        },
        [translate],
    );

    /**
     * Execute the onConfirm callback and close the modal.
     */
    const submitAndClose = useCallback(() => {
        // If the modal has already been closed
        if (!isModalOpen) {
            return;
        }

        if (onConfirm) {
            if (validFilesToUpload.length) {
                onConfirm(validFilesToUpload);
            } else if (currentAttachment) {
                onConfirm(currentAttachment.file ?? (currentAttachment as FileObject));
            }
        }

        setIsModalOpen(false);
    }, [isModalOpen, onConfirm, validFilesToUpload, currentAttachment]);

    /**
     * Sanitizes file names and ensures proper URI references for file system compatibility
     */
    const cleanFileObjectName = useCallback((fileObject: FileObject): FileObject => {
        if (fileObject instanceof File) {
            const cleanName = cleanFileName(fileObject.name);
            if (fileObject.name !== cleanName) {
                const updatedFile = new File([fileObject], cleanName, {type: fileObject.type});
                const inputSource = URL.createObjectURL(updatedFile);
                updatedFile.uri = inputSource;
                return updatedFile;
            }
            if (!fileObject.uri) {
                const inputSource = URL.createObjectURL(fileObject);
                // eslint-disable-next-line no-param-reassign
                fileObject.uri = inputSource;
            }
        }
        return fileObject;
    }, []);

    const convertFileToAttachment = useCallback((fileObject: FileObject, source: string): Attachment => {
        return {
            source,
            file: fileObject,
        };
    }, []);

    useEffect(() => {
        if (!validFilesToUpload.length) {
            return;
        }

        if (validFilesToUpload.length > 0) {
            // Convert all files to attachments
            const newAttachments = validFilesToUpload.map((fileObject) => {
                const source = fileObject.uri ?? '';
                return convertFileToAttachment(fileObject, source);
            });

            const firstAttachment = newAttachments.at(0) ?? null;
            setAttachments(newAttachments);
            setCurrentAttachment(firstAttachment);
            setPage(0);

            if (firstAttachment?.file) {
                const inputModalType = getModalType(firstAttachment.source as string, firstAttachment.file);
                setModalType(inputModalType);
            }

            setIsModalOpen(true);
        }
    }, [validFilesToUpload, convertFileToAttachment, getModalType]);

    const {ErrorModal, validateFiles, PDFValidationComponent} = useFilesValidation(setValidFilesToUpload, false);

    const validateAndDisplayMultipleFilesToUpload = useCallback(
        (data: FileObject[], items?: DataTransferItem[]) => {
            if (!data?.length) {
                return;
            }

            const validIndices: number[] = [];
            const fileObjects = data
                .map((item, index) => {
                    let fileObject = item;
                    if ('getAsFile' in item && typeof item.getAsFile === 'function') {
                        fileObject = item.getAsFile() as FileObject;
                    }
                    const cleanedFileObject = cleanFileObjectName(fileObject);
                    if (cleanedFileObject !== null) {
                        validIndices.push(index);
                    }
                    return cleanedFileObject;
                })
                .filter((fileObject): fileObject is FileObject => fileObject !== null);

            if (!fileObjects.length) {
                return;
            }

            // Create a filtered items array that matches the fileObjects
            const filteredItems = items && validIndices.length > 0 ? validIndices.map((index) => items.at(index) ?? ({} as DataTransferItem)) : undefined;

            validateFiles(fileObjects, filteredItems);
        },
        [cleanFileObjectName, validateFiles],
    );

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const headerTitleNew = headerTitle ?? translate('reportActionCompose.sendAttachment');

    const submitRef = useRef<View | HTMLElement>(null);

    return (
        <>
            {PDFValidationComponent}
            <Modal
                type={modalType}
                onClose={closeModal}
                isVisible={isModalOpen}
                onModalShow={() => {
                    onModalShow();
                }}
                onModalHide={() => {
                    onModalHide();
                    clearAttachmentErrors();
                    setValidFilesToUpload([]);
                    setAttachments([]);
                    setCurrentAttachment(null);
                    setPage(0);
                }}
                propagateSwipe
                initialFocus={() => {
                    if (!submitRef.current) {
                        return false;
                    }
                    return submitRef.current;
                }}
                shouldHandleNavigationBack
            >
                <GestureHandlerRootView style={styles.flex1}>
                    {shouldUseNarrowLayout && <HeaderGap />}
                    <HeaderWithBackButton
                        shouldMinimizeMenuButton
                        title={headerTitleNew}
                        shouldShowBorderBottom
                        shouldShowCloseButton={!shouldUseNarrowLayout}
                        shouldShowBackButton={shouldUseNarrowLayout}
                        onBackButtonPress={closeModal}
                        onCloseButtonPress={closeModal}
                        shouldSetModalVisibility={false}
                        shouldDisplayHelpButton={false}
                    />
                    {attachments.length > 0 && !!currentAttachment && (
                        <AttachmentCarouselView
                            attachments={attachments}
                            source={currentAttachment.source}
                            page={page}
                            setPage={setPage}
                            onClose={closeModal}
                            autoHideArrows={autoHideArrows}
                            cancelAutoHideArrow={cancelAutoHideArrows}
                            setShouldShowArrows={setShouldShowArrows}
                            onAttachmentError={setAttachmentError}
                            shouldShowArrows={shouldShowArrows}
                        />
                    )}
                    <LayoutAnimationConfig skipEntering>
                        {(validFilesToUpload.length > 0 || !!currentAttachment) && (
                            <SafeAreaConsumer>
                                {({safeAreaPaddingBottomStyle}) => (
                                    <Animated.View
                                        style={safeAreaPaddingBottomStyle}
                                        entering={FadeIn}
                                    >
                                        <Button
                                            ref={viewRef(submitRef)}
                                            success
                                            large
                                            style={[styles.buttonConfirm, shouldUseNarrowLayout ? {} : styles.attachmentButtonBigScreen]}
                                            textStyles={[styles.buttonConfirmText]}
                                            text={translate('common.send')}
                                            onPress={submitAndClose}
                                            isDisabled={shouldDisableSendButton}
                                            pressOnEnter
                                        />
                                    </Animated.View>
                                )}
                            </SafeAreaConsumer>
                        )}
                    </LayoutAnimationConfig>
                </GestureHandlerRootView>
            </Modal>
            {children?.({
                displayFilesInModal: validateAndDisplayMultipleFilesToUpload,
                show: openModal,
            })}
            {ErrorModal}
        </>
    );
}

AttachmentComposerModal.displayName = 'AttachmentComposerModal';

export default memo(AttachmentComposerModal);

export type {FileObject, ImagePickerResponse};
