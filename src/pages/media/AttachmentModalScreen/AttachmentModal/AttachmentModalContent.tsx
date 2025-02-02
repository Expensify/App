import type {RefObject} from 'react';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {Keyboard, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Animated, {FadeIn, useSharedValue} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import AttachmentCarousel from '@components/Attachments/AttachmentCarousel';
import AttachmentCarouselPagerContext from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import AttachmentView from '@components/Attachments/AttachmentView';
import type {Attachment} from '@components/Attachments/types';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderGap from '@components/HeaderGap';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import fileDownload from '@libs/fileDownload';
import {cleanFileName, getFileName, validateImageForCorruption} from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getOriginalMessage, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {hasEReceipt, hasMissingSmartscanFields, hasReceipt, hasReceiptSource, isReceiptBeingScanned} from '@libs/TransactionUtils';
import type {AvatarSource} from '@libs/UserUtils';
import type {AttachmentModalChildrenProps, FileObject} from '@pages/media/AttachmentModalScreen/types';
import variables from '@styles/variables';
import {detachReceipt} from '@userActions/IOU';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import viewRef from '@src/types/utils/viewRef';

type AttachmentModalContentProps = {
    /** Optional source (URL, SVG function) for the image shown. If not passed in via props must be specified when modal is opened. */
    source?: AvatarSource;

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
    //
    /** The type of the attachment */
    type?: ValueOf<typeof CONST.ATTACHMENT_TYPE>;

    /** If the attachment originates from a note, the accountID will represent the author of that note. */
    accountID?: number;

    /** The data is loading or not */
    isLoading?: boolean;

    /** Should display not found page or not */
    shouldShowNotFoundPage?: boolean;

    /** Denotes whether it is a workspace avatar or not */
    isWorkspaceAvatar?: boolean;

    /** Denotes whether it can be an icon (ex: SVG) */
    maybeIcon?: boolean;

    /** Whether it is a receipt attachment or not */
    isReceiptAttachment?: boolean;

    /** A function as a child to pass modal launching methods to */
    children?: React.FC<AttachmentModalChildrenProps>;

    fallbackSource?: AvatarSource;

    canEditReceipt?: boolean;

    shouldDisableSendButton?: boolean;

    attachmentLink?: string;

    /** Optional callback to fire when we want to preview an image and approve it for use. */
    onConfirm?: ((file: FileObject) => void) | null;

    /** Optional callback to fire when we want to do something after attachment carousel changes. */
    onCarouselAttachmentChange?: (attachment: Attachment) => void;

    /// ///////////
    isAttachmentInvalid: boolean;
    shouldLoadAttachment: boolean;
    setIsAttachmentInvalid: (value: boolean) => void;
    isOpen: boolean;
    setIsModalOpen: (value: boolean) => void;
    attachmentInvalidReason: TranslationPaths | null;
    setAttachmentInvalidReason: (value: TranslationPaths | null) => void;
    attachmentInvalidReasonTitle: TranslationPaths | null;
    setAttachmentInvalidReasonTitle: (value: TranslationPaths | null) => void;
    submitRef: RefObject<View | HTMLElement>;

    closeModal: (shouldCallDirectly?: boolean) => void;
    closeConfirmModal: () => void;
    openModal: () => void;

    onSubmitAndClose: () => void;
    onPdfLoadError: () => void;
    onInvalidReasonModalHide: () => void;
    onUploadFileValidated: (type: 'file' | 'uri', sourceURL: string, fileObject: FileObject) => void;
};

function AttachmentModalContent({
    isOpen = false,
    source = '',
    // defaultOpen = false,
    originalFileName = '',
    isAuthTokenRequired = false,
    allowDownload = false,
    isTrackExpenseAction = false,
    report,
    isReceiptAttachment = false,
    isWorkspaceAvatar = false,
    maybeIcon = false,
    headerTitle,
    children,
    fallbackSource,
    canEditReceipt = false,
    isLoading = false,
    shouldShowNotFoundPage = false,
    type = undefined,
    accountID = undefined,
    shouldDisableSendButton = false,
    attachmentLink = '',
    onConfirm,
    onCarouselAttachmentChange = () => {},

    isAttachmentInvalid,
    shouldLoadAttachment,
    setIsAttachmentInvalid,
    setIsModalOpen,
    attachmentInvalidReason,
    setAttachmentInvalidReason,
    attachmentInvalidReasonTitle,
    setAttachmentInvalidReasonTitle,
    submitRef,

    closeModal,
    closeConfirmModal,
    openModal,

    onSubmitAndClose,
    onPdfLoadError,
    onInvalidReasonModalHide,
    onUploadFileValidated,
}: AttachmentModalContentProps) {
    const styles = useThemeStyles();

    const [isDeleteReceiptConfirmModalVisible, setIsDeleteReceiptConfirmModalVisible] = useState(false);
    const [isAuthTokenRequiredState, setIsAuthTokenRequiredState] = useState(isAuthTokenRequired);
    const [sourceState, setSourceState] = useState<AvatarSource>(() => source);
    const [isConfirmButtonDisabled, setIsConfirmButtonDisabled] = useState(false);
    const [isDownloadButtonReadyToBeShown, setIsDownloadButtonReadyToBeShown] = React.useState(true);
    // const isPDFLoadError = useRef(false);
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const nope = useSharedValue(false);
    const iouType = useMemo(() => (isTrackExpenseAction ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT), [isTrackExpenseAction]);
    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const transactionID = (isMoneyRequestAction(parentReportAction) && getOriginalMessage(parentReportAction)?.IOUTransactionID) || CONST.DEFAULT_NUMBER_ID;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const [currentAttachmentLink, setCurrentAttachmentLink] = useState(attachmentLink);

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
            setCurrentAttachmentLink(attachment?.attachmentLink ?? '');
        },
        [onCarouselAttachmentChange],
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
            const fileName = type === CONST.ATTACHMENT_TYPE.SEARCH ? getFileName(`${sourceURL}`) : file?.name;
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
        if (!isOpen || isConfirmButtonDisabled) {
            return;
        }

        if (onConfirm) {
            onConfirm(Object.assign(file ?? {}, {source: sourceState} as FileObject));
        }

        onSubmitAndClose();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isOpen, isConfirmButtonDisabled, onConfirm, file, sourceState]);

    /**
     * Detach the receipt and close the modal.
     */
    const deleteAndCloseModal = useCallback(() => {
        detachReceipt(transaction?.transactionID);
        setIsDeleteReceiptConfirmModalVisible(false);
        Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID));
    }, [transaction, report]);

    const isValidFile = useCallback(
        (fileObject: FileObject) =>
            validateImageForCorruption(fileObject)
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
        [setAttachmentInvalidReason, setAttachmentInvalidReasonTitle, setIsAttachmentInvalid],
    );

    const isDirectoryCheck = useCallback(
        (data: FileObject) => {
            if ('webkitGetAsEntry' in data && (data as DataTransferItem).webkitGetAsEntry()?.isDirectory) {
                setIsAttachmentInvalid(true);
                setAttachmentInvalidReasonTitle('attachmentPicker.attachmentError');
                setAttachmentInvalidReason('attachmentPicker.folderNotAllowedMessage');
                return false;
            }
            return true;
        },
        [setAttachmentInvalidReason, setAttachmentInvalidReasonTitle, setIsAttachmentInvalid],
    );

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
                    const cleanName = cleanFileName(updatedFile.name);
                    if (updatedFile.name !== cleanName) {
                        updatedFile = new File([updatedFile], cleanName, {type: updatedFile.type});
                    }
                    const inputSource = URL.createObjectURL(updatedFile);
                    updatedFile.uri = inputSource;
                    setIsModalOpen(true);
                    setSourceState(inputSource);
                    setFile(updatedFile);
                    onUploadFileValidated('file', inputSource, updatedFile);
                } else if (fileObject.uri) {
                    setIsModalOpen(true);
                    setSourceState(fileObject.uri);
                    setFile(fileObject);
                    onUploadFileValidated('uri', fileObject.uri, fileObject);
                }
            });
        },
        [isDirectoryCheck, isValidFile, setIsModalOpen, onUploadFileValidated],
    );

    // /**
    //  * Closes the modal.
    //  * @param {boolean} [shouldCallDirectly] If true, directly calls `onModalClose`.
    //  * This is useful when you plan to continue navigating to another page after closing the modal, to avoid freezing the app due to navigating to another page first and dismissing the modal later.
    //  * If `shouldCallDirectly` is false or undefined, it calls `attachmentModalHandler.handleModalClose` to close the modal.
    //  * This ensures smooth modal closing behavior without causing delays in closing.
    //  */
    // const closeModal = useCallback(
    //     (shouldCallDirectly?: boolean) => {
    //         setIsModalOpen(false);

    //         if (typeof onModalClose === 'function') {
    //             if (shouldCallDirectly) {
    //                 onModalClose();
    //                 return;
    //             }
    //             attachmentModalHandler.handleModalClose(onModalClose);
    //         }

    //         // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    //     },
    //     [onModalClose],
    // );

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
                    closeModal(true);
                    Navigation.navigate(
                        ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.EDIT, iouType, transaction?.transactionID, report?.reportID, Navigation.getActiveRouteWithoutParams()),
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

        const hasOnlyEReceipt = hasEReceipt(transaction) && !hasReceiptSource(transaction);
        if (!hasOnlyEReceipt && hasReceipt(transaction) && !isReceiptBeingScanned(transaction) && canEditReceipt && !hasMissingSmartscanFields(transaction)) {
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
        shouldShowThreeDotsButton = isReceiptAttachment && isOpen && threeDotsMenuItems.length !== 0;
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

    return (
        <>
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
                    subTitleLink={currentAttachmentLink ?? ''}
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
                                attachmentLink={currentAttachmentLink}
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
                                        onPDFLoadError={onPdfLoadError}
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
            {!isReceiptAttachment && (
                <ConfirmModal
                    title={attachmentInvalidReasonTitle ? translate(attachmentInvalidReasonTitle) : ''}
                    onConfirm={closeConfirmModal}
                    onCancel={closeConfirmModal}
                    isVisible={isAttachmentInvalid}
                    prompt={attachmentInvalidReason ? translate(attachmentInvalidReason) : ''}
                    confirmText={translate('common.close')}
                    shouldShowCancelButton={false}
                    onModalHide={onInvalidReasonModalHide}
                />
            )}

            {children?.({
                displayFileInModal: validateAndDisplayFileToUpload,
                show: openModal,
            })}
        </>
    );
}

AttachmentModalContent.displayName = 'AttachmentModalContent';

export default memo(AttachmentModalContent);

export type {AttachmentModalContentProps};
