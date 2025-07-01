import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InteractionManager, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeIn, LayoutAnimationConfig, useSharedValue } from 'react-native-reanimated';
import type { ValueOf } from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import { cleanFileName, getFileValidationErrorText, validateAttachment, validateImageForCorruption } from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';
import type ModalType from '@src/types/utils/ModalType';
import viewRef from '@src/types/utils/viewRef';
import AttachmentCarouselPagerContext from './Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import AttachmentView from './Attachments/AttachmentView';
import useAttachmentErrors from './Attachments/AttachmentView/useAttachmentErrors';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
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
    displayFileInModal: (data: FileObject) => void;
    displayMultipleFilesInModal: (data: FileObject[]) => void;
    show: () => void;
};

type AttachmentComposerModalProps = {
    /** Optional callback to fire when we want to preview an image and approve it for use. */
    onConfirm?: ((file: FileObject | FileObject[]) => void) | null;

    /** Title shown in the header of the modal */
    headerTitle?: string;

    /** The ID of the current report */
    reportID?: string;

    /** Optional callback to fire when we want to do something after modal show. */
    onModalShow?: () => void;

    /** Optional callback to fire when we want to do something after modal hide. */
    onModalHide?: () => void;

    /** A function as a child to pass modal launching methods to */
    children?: React.FC<ChildrenProps>;

    /** Should disable send button */
    shouldDisableSendButton?: boolean;

    /** Should handle navigation back */
    shouldHandleNavigationBack?: boolean;
};

function AttachmentComposerModal({
    onConfirm,
    reportID,
    onModalShow = () => {},
    onModalHide = () => {},
    headerTitle,
    children,
    shouldDisableSendButton = false,
    shouldHandleNavigationBack,
}: AttachmentComposerModalProps) {
    const styles = useThemeStyles();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [shouldLoadAttachment, setShouldLoadAttachment] = useState(false);
    const [fileError, setFileError] = useState<ValueOf<typeof CONST.FILE_VALIDATION_ERRORS> | null>(null);
    const [isFileErrorModalVisible, setIsFileErrorModalVisible] = useState(false);
    const [sourceState, setSourceState] = useState<string>('');
    const [modalType, setModalType] = useState<ModalType>(CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE);
    const [isConfirmButtonDisabled, setIsConfirmButtonDisabled] = useState(false);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const nope = useSharedValue(false);
    const [validFilesToUpload, setValidFilesToUpload] = useState<FileObject[]>([]);
    const {setAttachmentError, clearAttachmentErrors} = useAttachmentErrors();

    const [file, setFile] = useState<FileObject | undefined>(undefined);
    const {translate} = useLocalize();

    /**
     * If our attachment is a PDF, return the unswipeable Modal type.
     */
    const getModalType = useCallback(
        (sourceURL: string, fileObject: FileObject) => {
            const fileName = fileObject?.name ?? translate('attachmentView.unknownFilename');
            return sourceURL && (sourceURL.includes('.pdf') || fileName.includes('.pdf'))
                ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
                : CONST.MODAL.MODAL_TYPE.CENTERED;
        },
        [translate],
    );

    /**
     * Execute the onConfirm callback and close the modal.
     */
    const submitAndClose = useCallback(() => {
        // If the modal has already been closed or the confirm button is disabled
        // do not submit.
        if (!isModalOpen || isConfirmButtonDisabled) {
            return;
        }

        if (onConfirm) {
            if (validFilesToUpload.length) {
                onConfirm(validFilesToUpload);
            } else {
                onConfirm(Object.assign(file ?? {}, {source: sourceState} as FileObject));
            }
        }

        setIsModalOpen(false);
    }, [isModalOpen, isConfirmButtonDisabled, onConfirm, file, sourceState, validFilesToUpload]);

    /**
     * Close the confirm modals.
     */
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

    const isDirectoryCheck = useCallback((data: FileObject) => {
        if ('webkitGetAsEntry' in data && (data as DataTransferItem).webkitGetAsEntry()?.isDirectory) {
            setFileError(CONST.FILE_VALIDATION_ERRORS.FOLDER_NOT_ALLOWED);
            setIsFileErrorModalVisible(true);
            return false;
        }
        return true;
    }, []);

    const handleOpenModal = useCallback(
        (inputSource: string, fileObject: FileObject) => {
            const inputModalType = getModalType(inputSource, fileObject);
            setIsModalOpen(true);
            setSourceState(inputSource);
            setFile(fileObject);
            setModalType(inputModalType);
        },
        [getModalType],
    );

    useEffect(() => {
        if (!validFilesToUpload.length) {
            return;
        }

        if (validFilesToUpload.length > 0) {
            if (fileError) {
                return;
            }
            const fileToDisplay = validFilesToUpload.at(0);
            if (fileToDisplay) {
                const inputSource = fileToDisplay.uri ?? '';
                handleOpenModal(inputSource, fileToDisplay);
            }
        }
    }, [fileError, handleOpenModal, validFilesToUpload]);

    const validateFiles = useCallback(
        (data: FileObject[]) => {
            let validFiles: FileObject[] = [];

            Promise.all(data.map((fileToUpload) => isValidFile(fileToUpload, true).then((isValid) => (isValid ? fileToUpload : null)))).then((results) => {
                validFiles = results.filter((validFile): validFile is FileObject => validFile !== null);
                setValidFilesToUpload(validFiles);
            });
        },
        [isValidFile],
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

    const validateAndDisplayFileToUpload = useCallback(
        (data: FileObject) => {
            if (!data || !isDirectoryCheck(data)) {
                return;
            }
            let fileObject = data;
            if ('getAsFile' in data && typeof data.getAsFile === 'function') {
                fileObject = data.getAsFile() as FileObject;
            }
            if (!fileObject) {
                return;
            }

            isValidFile(fileObject).then((isValid) => {
                if (!isValid) {
                    return;
                }
                if (fileObject instanceof File) {
                    let updatedFile = fileObject;
                    const cleanName = cleanFileName(updatedFile.name);
                    if (updatedFile.name !== cleanName) {
                        updatedFile = new File([updatedFile], cleanName, {type: updatedFile.type});
                    }
                    const inputSource = URL.createObjectURL(updatedFile);
                    updatedFile.uri = inputSource;
                    handleOpenModal(inputSource, updatedFile);
                } else if (fileObject.uri) {
                    handleOpenModal(fileObject.uri, fileObject);
                }
            });
        },
        [isDirectoryCheck, isValidFile, handleOpenModal],
    );

    const validateAndDisplayMultipleFilesToUpload = useCallback(
        (data: FileObject[]) => {
            if (!data?.length || data.some((fileObject) => !isDirectoryCheck(fileObject))) {
                return;
            }
            if (data.length > CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT) {
                const validFiles = data.slice(0, CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT);
                setValidFilesToUpload(validFiles);
                setFileError(CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED);
                setIsFileErrorModalVisible(true);
                return;
            }
            validateFiles(data);
        },
        [isDirectoryCheck, validateFiles],
    );

    /**
     * Closes the modal.
     */
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const closeAndResetModal = useCallback(() => {
        closeConfirmModal();
        closeModal();
    }, [closeConfirmModal, closeModal]);

    /**
     *  open the modal
     */
    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const headerTitleNew = headerTitle ?? translate('reportActionCompose.sendAttachment');

    const context = useMemo(
        () => ({
            pagerItems: [{source: sourceState, index: 0, isActive: true}],
            activePage: 0,
            pagerRef: undefined,
            isPagerScrolling: nope,
            isScrollEnabled: nope,
            onTap: () => {},
            onScaleChanged: () => {},
            onSwipeDown: closeModal,
            onAttachmentError: setAttachmentError,
        }),
        [closeModal, setAttachmentError, nope, sourceState],
    );

    const submitRef = useRef<View | HTMLElement>(null);

    return (
        <>
            <Modal
                type={modalType}
                onClose={closeModal}
                isVisible={isModalOpen}
                onModalShow={() => {
                    onModalShow();
                    setShouldLoadAttachment(true);
                }}
                onModalHide={() => {
                    onModalHide();
                    setShouldLoadAttachment(false);
                    clearAttachmentErrors();
                    setValidFilesToUpload([]);
                }}
                propagateSwipe
                initialFocus={() => {
                    if (!submitRef.current) {
                        return false;
                    }
                    return submitRef.current;
                }}
                shouldHandleNavigationBack={shouldHandleNavigationBack}
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
                    <View style={styles.imageModalImageCenterContainer}>
                        {!!sourceState &&
                            shouldLoadAttachment && (
                                <AttachmentCarouselPagerContext.Provider value={context}>
                                    <AttachmentView
                                        containerStyles={[styles.mh5]}
                                        source={sourceState}
                                        isAuthTokenRequired={false}
                                        file={file}
                                        onToggleKeyboard={setIsConfirmButtonDisabled}
                                        isUsedInAttachmentModal
                                        reportID={reportID}
                                    />
                                </AttachmentCarouselPagerContext.Provider>
                            )}
                    </View>
                    {/* Show confirmation button */}
                    <LayoutAnimationConfig skipEntering>
                        {!!onConfirm && !isConfirmButtonDisabled && (
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
                                            isDisabled={isConfirmButtonDisabled || shouldDisableSendButton}
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
                displayFileInModal: validateAndDisplayFileToUpload,
                displayMultipleFilesInModal: validateAndDisplayMultipleFilesToUpload,
                show: openModal,
            })}
        </>
    );
}

AttachmentComposerModal.displayName = 'AttachmentComposerModal';

export default memo(AttachmentComposerModal);

export type {FileObject, ImagePickerResponse};
