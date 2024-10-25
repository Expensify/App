import {Str} from 'expensify-common';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Keyboard, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {useSharedValue} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import fileDownload from '@libs/fileDownload';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import type {AvatarSource} from '@libs/UserUtils';
import variables from '@styles/variables';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type ModalType from '@src/types/utils/ModalType';
import viewRef from '@src/types/utils/viewRef';
import AttachmentCarousel from './Attachments/AttachmentCarousel';
import AttachmentCarouselPagerContext from './Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import AttachmentView from './Attachments/AttachmentView';
import type {Attachment} from './Attachments/types';
import BlockingView from './BlockingViews/BlockingView';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import FullScreenLoadingIndicator from './FullscreenLoadingIndicator';
import HeaderGap from './HeaderGap';
import HeaderWithBackButton from './HeaderWithBackButton';
import * as Expensicons from './Icon/Expensicons';
import * as Illustrations from './Icon/Illustrations';
import Modal from './Modal';
import SafeAreaConsumer from './SafeAreaConsumer';

/**
 * Modal render prop component that exposes modal launching triggers that can be used
 * to display a full size image or PDF modally with optional confirmation button.
 */

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
    show: () => void;
};

type AttachmentModalProps = {
    /** Optional source (URL, SVG function) for the image shown. If not passed in via props must be specified when modal is opened. */
    source?: AvatarSource;

    /** Optional callback to fire when we want to preview an image and approve it for use. */
    onConfirm?: ((file: FileObject) => void) | null;

    /** Whether the modal should be open by default */
    defaultOpen?: boolean;

    /** Trigger when we explicity click close button in ProfileAttachment modal */
    onModalClose?: () => void;

    /** Optional original filename when uploading */
    originalFileName?: string;

    /** Whether source url requires authentication */
    isAuthTokenRequired?: boolean;

    /** Determines if download Button should be shown or not */
    allowDownload?: boolean;

    /** Determines if the receipt comes from track expense action */
    isTrackExpenseAction?: boolean;

    /** Title shown in the header of the modal */
    headerTitle?: string;

    /** The report that has this attachment */
    report?: OnyxEntry<OnyxTypes.Report>;

    /** The type of the attachment */
    type?: ValueOf<typeof CONST.ATTACHMENT_TYPE>;

    /** If the attachment originates from a note, the accountID will represent the author of that note. */
    accountID?: number;

    /** Optional callback to fire when we want to do something after modal show. */
    onModalShow?: () => void;

    /** Optional callback to fire when we want to do something after modal hide. */
    onModalHide?: () => void;

    /** The data is loading or not */
    isLoading?: boolean;

    /** Should display not found page or not */
    shouldShowNotFoundPage?: boolean;

    /** Optional callback to fire when we want to do something after attachment carousel changes. */
    onCarouselAttachmentChange?: (attachment: Attachment) => void;

    /** Denotes whether it is a workspace avatar or not */
    isWorkspaceAvatar?: boolean;

    /** Denotes whether it can be an icon (ex: SVG) */
    maybeIcon?: boolean;

    /** Whether it is a receipt attachment or not */
    isReceiptAttachment?: boolean;

    /** A function as a child to pass modal launching methods to */
    children?: React.FC<ChildrenProps>;

    fallbackSource?: AvatarSource;

    canEditReceipt?: boolean;

    shouldDisableSendButton?: boolean;
};

function AttachmentModal({
    source = '',
    onConfirm,
    defaultOpen = false,
    originalFileName = '',
    isAuthTokenRequired = false,
    allowDownload = false,
    isTrackExpenseAction = false,
    report,
    onModalShow = () => {},
    onModalHide = () => {},
    onCarouselAttachmentChange = () => {},
    isReceiptAttachment = false,
    isWorkspaceAvatar = false,
    maybeIcon = false,
    headerTitle,
    children,
    fallbackSource,
    canEditReceipt = false,
    onModalClose = () => {},
    isLoading = false,
    shouldShowNotFoundPage = false,
    type = undefined,
    accountID = undefined,
    shouldDisableSendButton = false,
}: AttachmentModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isModalOpen, setIsModalOpen] = useState(defaultOpen);
    const [shouldLoadAttachment, setShouldLoadAttachment] = useState(false);
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [isDeleteReceiptConfirmModalVisible, setIsDeleteReceiptConfirmModalVisible] = useState(false);
    const [isAuthTokenRequiredState, setIsAuthTokenRequiredState] = useState(isAuthTokenRequired);
    const [attachmentInvalidReasonTitle, setAttachmentInvalidReasonTitle] = useState<TranslationPaths | null>(null);
    const [attachmentInvalidReason, setAttachmentInvalidReason] = useState<TranslationPaths | null>(null);
    const [sourceState, setSourceState] = useState<AvatarSource>(() => source);
    const [modalType, setModalType] = useState<ModalType>(CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE);
    const [isConfirmButtonDisabled, setIsConfirmButtonDisabled] = useState(false);
    const [confirmButtonFadeAnimation] = useState(() => new Animated.Value(1));
    const [isDownloadButtonReadyToBeShown, setIsDownloadButtonReadyToBeShown] = React.useState(true);
    const isPDFLoadError = useRef(false);
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const nope = useSharedValue(false);
    const isOverlayModalVisible = (isReceiptAttachment && isDeleteReceiptConfirmModalVisible) || (!isReceiptAttachment && isAttachmentInvalid);
    const iouType = useMemo(() => (isTrackExpenseAction ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT), [isTrackExpenseAction]);
    const parentReportAction = ReportActionsUtils.getReportAction(report?.parentReportID ?? '-1', report?.parentReportActionID ?? '-1');
    const transactionID = ReportActionsUtils.isMoneyRequestAction(parentReportAction) ? ReportActionsUtils.getOriginalMessage(parentReportAction)?.IOUTransactionID ?? '-1' : '-1';
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);

    const [file, setFile] = useState<FileObject | undefined>(
        originalFileName
            ? {
                  name: originalFileName,
              }
            : undefined,
    );
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const isLocalSource = typeof sourceState === 'string' && /^file:|^blob:/.test(sourceState);

    useEffect(() => {
        setFile(originalFileName ? {name: originalFileName} : undefined);
    }, [originalFileName]);

    /**
     * Keeps the attachment source in sync with the attachment displayed currently in the carousel.
     */
    const onNavigate = useCallback(
        (attachment: Attachment) => {
            setSourceState(attachment.source);
            setFile(attachment.file);
            setIsAuthTokenRequiredState(attachment.isAuthTokenRequired ?? false);
            onCarouselAttachmentChange(attachment);
        },
        [onCarouselAttachmentChange],
    );

    /**
     * If our attachment is a PDF, return the unswipeablge Modal type.
     */
    const getModalType = useCallback(
        (sourceURL: string, fileObject: FileObject) =>
            sourceURL && (Str.isPDF(sourceURL) || (fileObject && Str.isPDF(fileObject.name ?? translate('attachmentView.unknownFilename'))))
                ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
                : CONST.MODAL.MODAL_TYPE.CENTERED,
        [translate],
    );

    const setDownloadButtonVisibility = useCallback(
        (isButtonVisible: boolean) => {
            if (isDownloadButtonReadyToBeShown === isButtonVisible) {
                return;
            }
            setIsDownloadButtonReadyToBeShown(isButtonVisible);
        },
        [isDownloadButtonReadyToBeShown],
    );

    /**
     * Download the currently viewed attachment.
     */
    const downloadAttachment = useCallback(() => {
        let sourceURL = sourceState;
        if (isAuthTokenRequiredState && typeof sourceURL === 'string') {
            sourceURL = addEncryptedAuthTokenToURL(sourceURL);
        }

        if (typeof sourceURL === 'string') {
            const fileName = type === CONST.ATTACHMENT_TYPE.SEARCH ? FileUtils.getFileName(`${sourceURL}`) : file?.name;
            fileDownload(sourceURL, fileName ?? '');
        }

        // At ios, if the keyboard is open while opening the attachment, then after downloading
        // the attachment keyboard will show up. So, to fix it we need to dismiss the keyboard.
        Keyboard.dismiss();
    }, [isAuthTokenRequiredState, sourceState, file, type]);

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
            onConfirm(Object.assign(file ?? {}, {source: sourceState} as FileObject));
        }

        setIsModalOpen(false);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isModalOpen, isConfirmButtonDisabled, onConfirm, file, sourceState]);

    /**
     * Close the confirm modals.
     */
    const closeConfirmModal = useCallback(() => {
        setIsAttachmentInvalid(false);
        setIsDeleteReceiptConfirmModalVisible(false);
    }, []);

    /**
     * Detach the receipt and close the modal.
     */
    const deleteAndCloseModal = useCallback(() => {
        IOU.detachReceipt(transaction?.transactionID ?? '-1');
        setIsDeleteReceiptConfirmModalVisible(false);
        Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID ?? '-1'));
    }, [transaction, report]);

    const isValidFile = useCallback(
        (fileObject: FileObject) =>
            FileUtils.validateImageForCorruption(fileObject)
                .then(() => {
                    if (fileObject.size && fileObject.size > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                        setIsAttachmentInvalid(true);
                        setAttachmentInvalidReasonTitle('attachmentPicker.attachmentTooLarge');
                        setAttachmentInvalidReason('attachmentPicker.sizeExceeded');
                        return false;
                    }

                    if (fileObject.size && fileObject.size < CONST.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
                        setIsAttachmentInvalid(true);
                        setAttachmentInvalidReasonTitle('attachmentPicker.attachmentTooSmall');
                        setAttachmentInvalidReason('attachmentPicker.sizeNotMet');
                        return false;
                    }

                    return true;
                })
                .catch(() => {
                    setIsAttachmentInvalid(true);
                    setAttachmentInvalidReasonTitle('attachmentPicker.attachmentError');
                    setAttachmentInvalidReason('attachmentPicker.errorWhileSelectingCorruptedAttachment');
                    return false;
                }),
        [],
    );

    const isDirectoryCheck = useCallback((data: FileObject) => {
        if ('webkitGetAsEntry' in data && (data as DataTransferItem).webkitGetAsEntry()?.isDirectory) {
            setIsAttachmentInvalid(true);
            setAttachmentInvalidReasonTitle('attachmentPicker.attachmentError');
            setAttachmentInvalidReason('attachmentPicker.folderNotAllowedMessage');
            return false;
        }
        return true;
    }, []);

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
                    /**
                     * Cleaning file name, done here so that it covers all cases:
                     * upload, drag and drop, copy-paste
                     */
                    let updatedFile = fileObject;
                    const cleanName = FileUtils.cleanFileName(updatedFile.name);
                    if (updatedFile.name !== cleanName) {
                        updatedFile = new File([updatedFile], cleanName, {type: updatedFile.type});
                    }
                    const inputSource = URL.createObjectURL(updatedFile);
                    updatedFile.uri = inputSource;
                    const inputModalType = getModalType(inputSource, updatedFile);
                    setIsModalOpen(true);
                    setSourceState(inputSource);
                    setFile(updatedFile);
                    setModalType(inputModalType);
                } else if (fileObject.uri) {
                    const inputModalType = getModalType(fileObject.uri, fileObject);
                    setIsModalOpen(true);
                    setSourceState(fileObject.uri);
                    setFile(fileObject);
                    setModalType(inputModalType);
                }
            });
        },
        [isValidFile, getModalType, isDirectoryCheck],
    );

    /**
     * close the modal
     */
    const closeModal = useCallback(() => {
        setIsModalOpen(false);

        if (typeof onModalClose === 'function') {
            onModalClose();
        }

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [onModalClose]);

    /**
     *  open the modal
     */
    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    useEffect(() => {
        setSourceState(() => source);
    }, [source]);

    useEffect(() => {
        setIsAuthTokenRequiredState(isAuthTokenRequired);
    }, [isAuthTokenRequired]);

    const sourceForAttachmentView = sourceState || source;

    const threeDotsMenuItems = useMemo(() => {
        if (!isReceiptAttachment) {
            return [];
        }

        const menuItems = [];
        if (canEditReceipt) {
            menuItems.push({
                icon: Expensicons.Camera,
                text: translate('common.replace'),
                onSelected: () => {
                    closeModal();
                    Navigation.navigate(
                        ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(
                            CONST.IOU.ACTION.EDIT,
                            iouType,
                            transaction?.transactionID ?? '-1',
                            report?.reportID ?? '-1',
                            Navigation.getActiveRouteWithoutParams(),
                        ),
                    );
                },
            });
        }
        if (!isOffline && allowDownload && !isLocalSource) {
            menuItems.push({
                icon: Expensicons.Download,
                text: translate('common.download'),
                onSelected: () => downloadAttachment(),
            });
        }
        if (
            !TransactionUtils.hasEReceipt(transaction) &&
            TransactionUtils.hasReceipt(transaction) &&
            !TransactionUtils.isReceiptBeingScanned(transaction) &&
            canEditReceipt &&
            !TransactionUtils.hasMissingSmartscanFields(transaction)
        ) {
            menuItems.push({
                icon: Expensicons.Trashcan,
                text: translate('receipt.deleteReceipt'),
                onSelected: () => {
                    setIsDeleteReceiptConfirmModalVisible(true);
                },
                shouldCallAfterModalHide: true,
            });
        }
        return menuItems;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isReceiptAttachment, transaction, file, sourceState, iouType]);

    // There are a few things that shouldn't be set until we absolutely know if the file is a receipt or an attachment.
    // props.isReceiptAttachment will be null until its certain what the file is, in which case it will then be true|false.
    let headerTitleNew = headerTitle;
    let shouldShowDownloadButton = false;
    let shouldShowThreeDotsButton = false;
    if (!isEmptyObject(report) || type === CONST.ATTACHMENT_TYPE.SEARCH) {
        headerTitleNew = translate(isReceiptAttachment ? 'common.receipt' : 'common.attachment');
        shouldShowDownloadButton = allowDownload && isDownloadButtonReadyToBeShown && !shouldShowNotFoundPage && !isReceiptAttachment && !isOffline && !isLocalSource;
        shouldShowThreeDotsButton = isReceiptAttachment && isModalOpen && threeDotsMenuItems.length !== 0;
    }
    const context = useMemo(
        () => ({
            pagerItems: [{source: sourceForAttachmentView, index: 0, isActive: true}],
            activePage: 0,
            pagerRef: undefined,
            isPagerScrolling: nope,
            isScrollEnabled: nope,
            onTap: () => {},
            onScaleChanged: () => {},
            onSwipeDown: closeModal,
        }),
        [closeModal, nope, sourceForAttachmentView],
    );

    const submitRef = useRef<View | HTMLElement>(null);

    return (
        <>
            <Modal
                type={modalType}
                onSubmit={submitAndClose}
                onClose={isOverlayModalVisible ? closeConfirmModal : closeModal}
                isVisible={isModalOpen}
                onModalShow={() => {
                    onModalShow();
                    setShouldLoadAttachment(true);
                }}
                onModalHide={() => {
                    if (!isPDFLoadError.current) {
                        onModalHide();
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
                <GestureHandlerRootView style={styles.flex1}>
                    {shouldUseNarrowLayout && <HeaderGap />}
                    <HeaderWithBackButton
                        title={headerTitleNew}
                        shouldShowBorderBottom
                        shouldShowDownloadButton={shouldShowDownloadButton}
                        onDownloadButtonPress={() => downloadAttachment()}
                        shouldShowCloseButton={!shouldUseNarrowLayout}
                        shouldShowBackButton={shouldUseNarrowLayout}
                        onBackButtonPress={closeModal}
                        onCloseButtonPress={closeModal}
                        shouldShowThreeDotsButton={shouldShowThreeDotsButton}
                        threeDotsAnchorPosition={styles.threeDotsPopoverOffsetAttachmentModal(windowWidth)}
                        threeDotsMenuItems={threeDotsMenuItems}
                        shouldOverlayDots
                    />
                    <View style={styles.imageModalImageCenterContainer}>
                        {isLoading && <FullScreenLoadingIndicator />}
                        {shouldShowNotFoundPage && !isLoading && (
                            <BlockingView
                                icon={Illustrations.ToddBehindCloud}
                                iconWidth={variables.modalTopIconWidth}
                                iconHeight={variables.modalTopIconHeight}
                                title={translate('notFound.notHere')}
                                subtitle={translate('notFound.pageNotFound')}
                                linkKey="notFound.goBackHome"
                                shouldShowLink
                                onLinkPress={() => Navigation.dismissModal()}
                            />
                        )}
                        {!shouldShowNotFoundPage &&
                            (!isEmptyObject(report) && !isReceiptAttachment ? (
                                <AttachmentCarousel
                                    accountID={accountID}
                                    type={type}
                                    report={report}
                                    onNavigate={onNavigate}
                                    onClose={closeModal}
                                    source={source}
                                    setDownloadButtonVisibility={setDownloadButtonVisibility}
                                />
                            ) : (
                                !!sourceForAttachmentView &&
                                shouldLoadAttachment &&
                                !isLoading && (
                                    <AttachmentCarouselPagerContext.Provider value={context}>
                                        <AttachmentView
                                            containerStyles={[styles.mh5]}
                                            source={sourceForAttachmentView}
                                            isAuthTokenRequired={isAuthTokenRequiredState}
                                            file={file}
                                            onToggleKeyboard={setIsConfirmButtonDisabled}
                                            onPDFLoadError={() => {
                                                isPDFLoadError.current = true;
                                                setIsModalOpen(false);
                                            }}
                                            isWorkspaceAvatar={isWorkspaceAvatar}
                                            maybeIcon={maybeIcon}
                                            fallbackSource={fallbackSource}
                                            isUsedInAttachmentModal
                                            transactionID={transaction?.transactionID}
                                            isUploaded={!isEmptyObject(report)}
                                        />
                                    </AttachmentCarouselPagerContext.Provider>
                                )
                            ))}
                    </View>
                    {/* If we have an onConfirm method show a confirmation button */}
                    {!!onConfirm && !isConfirmButtonDisabled && (
                        <SafeAreaConsumer>
                            {({safeAreaPaddingBottomStyle}) => (
                                <Animated.View style={[StyleUtils.fade(confirmButtonFadeAnimation), safeAreaPaddingBottomStyle]}>
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
                    {isReceiptAttachment && (
                        <ConfirmModal
                            title={translate('receipt.deleteReceipt')}
                            isVisible={isDeleteReceiptConfirmModalVisible}
                            onConfirm={deleteAndCloseModal}
                            onCancel={closeConfirmModal}
                            prompt={translate('receipt.deleteConfirmation')}
                            confirmText={translate('common.delete')}
                            cancelText={translate('common.cancel')}
                            danger
                        />
                    )}
                </GestureHandlerRootView>
            </Modal>
            {!isReceiptAttachment && (
                <ConfirmModal
                    title={attachmentInvalidReasonTitle ? translate(attachmentInvalidReasonTitle) : ''}
                    onConfirm={closeConfirmModal}
                    onCancel={closeConfirmModal}
                    isVisible={isAttachmentInvalid}
                    prompt={attachmentInvalidReason ? translate(attachmentInvalidReason) : ''}
                    confirmText={translate('common.close')}
                    shouldShowCancelButton={false}
                    onModalHide={() => {
                        if (!isPDFLoadError.current) {
                            return;
                        }
                        isPDFLoadError.current = false;
                        onModalHide?.();
                    }}
                />
            )}

            {children?.({
                displayFileInModal: validateAndDisplayFileToUpload,
                show: openModal,
            })}
        </>
    );
}

AttachmentModal.displayName = 'AttachmentModal';

export default memo(AttachmentModal);

export type {Attachment, FileObject, ImagePickerResponse};
