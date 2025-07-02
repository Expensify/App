import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import type {View} from 'react-native';
import {InteractionManager} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Animated, {FadeIn, LayoutAnimationConfig} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import AttachmentCarouselView from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView';
import useCarouselArrows from '@components/Attachments/AttachmentCarousel/useCarouselArrows';
import useAttachmentErrors from '@components/Attachments/AttachmentView/useAttachmentErrors';
import type {Attachment} from '@components/Attachments/types';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderGap from '@components/HeaderGap';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {cleanFileName, getFileValidationErrorText, validateAttachment, validateImageForCorruption} from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';
import type ModalType from '@src/types/utils/ModalType';
import viewRef from '@src/types/utils/viewRef';

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
    displayFilesInModal: (data: FileObject[]) => void;
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
    const [fileError, setFileError] = useState<ValueOf<typeof CONST.FILE_VALIDATION_ERRORS> | null>(null);
    const [isFileErrorModalVisible, setIsFileErrorModalVisible] = useState(false);
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

    const closeConfirmModal = useCallback(() => {
        setIsFileErrorModalVisible(false);
    }, []);

    const isValidFile = useCallback(
        (fileObject: FileObject, isCheckingMultipleFiles?: boolean) =>
            validateImageForCorruption(fileObject)
                .then(() => {
                    const error = validateAttachment(fileObject, isCheckingMultipleFiles);
                    if (error) {
                        setFileError(error);
                        setIsFileErrorModalVisible(true);
                        return false;
                    }
                    return true;
                })
                .catch(() => {
                    setFileError(CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED);
                    setIsFileErrorModalVisible(true);
                    return false;
                }),
        [],
    );

    // TODO: Check if this function is still needed, as it doesn't work.
    const isDirectoryCheck = useCallback((data: FileObject) => {
        if ('webkitGetAsEntry' in data && (data as DataTransferItem).webkitGetAsEntry()?.isDirectory) {
            setFileError(CONST.FILE_VALIDATION_ERRORS.FOLDER_NOT_ALLOWED);
            setIsFileErrorModalVisible(true);
            return false;
        }
        return true;
    }, []);

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

        if (validFilesToUpload.length > 0 && !fileError) {
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
    }, [fileError, validFilesToUpload, convertFileToAttachment, getModalType]);

    const validateFiles = useCallback(
        (data: FileObject[]) => {
            let validFiles: FileObject[] = [];

            Promise.all(data.map((fileToUpload) => isValidFile(fileToUpload, true).then((isValid) => (isValid ? cleanFileObjectName(fileToUpload) : null)))).then((results) => {
                validFiles = results.filter((validFile): validFile is FileObject => validFile !== null);
                setValidFilesToUpload(validFiles);
            });
        },
        [isValidFile, cleanFileObjectName],
    );

    const confirmAndContinue = () => {
        if (fileError === CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED) {
            validateFiles(validFilesToUpload);
        }
        setIsFileErrorModalVisible(false);
        InteractionManager.runAfterInteractions(() => {
            setFileError(null);
        });
    };

    const validateAndDisplayMultipleFilesToUpload = useCallback(
        (data: FileObject[]) => {
            if (!data?.length) {
                return;
            }

            const fileObjects = data
                .map((item) => {
                    let fileObject = item;
                    if ('getAsFile' in item && typeof item.getAsFile === 'function') {
                        fileObject = item.getAsFile() as FileObject;
                    }
                    return fileObject;
                })
                .filter((fileObject): fileObject is FileObject => fileObject !== null);

            if (!fileObjects.length || fileObjects.some((fileObject) => !isDirectoryCheck(fileObject))) {
                return;
            }
            if (fileObjects.length > CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT) {
                const validFiles = fileObjects.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
                setValidFilesToUpload(validFiles);
                setFileError(CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED);
                setIsFileErrorModalVisible(true);
                return;
            }
            validateFiles(fileObjects);
        },
        [isDirectoryCheck, validateFiles],
    );

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const closeAndResetModal = useCallback(() => {
        closeConfirmModal();
        closeModal();
        InteractionManager.runAfterInteractions(() => {
            setFileError(null);
            setValidFilesToUpload([]);
        });
    }, [closeConfirmModal, closeModal]);

    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const headerTitleNew = headerTitle ?? translate('reportActionCompose.sendAttachment');

    const submitRef = useRef<View | HTMLElement>(null);

    return (
        <>
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
            <ConfirmModal
                title={getFileValidationErrorText(fileError).title}
                onConfirm={confirmAndContinue}
                onCancel={closeAndResetModal}
                isVisible={isFileErrorModalVisible}
                prompt={getFileValidationErrorText(fileError).reason}
                confirmText={translate(validFilesToUpload.length ? 'common.continue' : 'common.close')}
                shouldShowCancelButton={!!validFilesToUpload.length}
                cancelText={translate('common.cancel')}
            />

            {children?.({
                displayFilesInModal: validateAndDisplayMultipleFilesToUpload,
                show: openModal,
            })}
        </>
    );
}

AttachmentComposerModal.displayName = 'AttachmentComposerModal';

export default memo(AttachmentComposerModal);

export type {FileObject, ImagePickerResponse};
