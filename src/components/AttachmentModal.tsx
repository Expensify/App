import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, Keyboard, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import type {OnyxEntry} from 'react-native-onyx';
import Animated, {FadeIn, LayoutAnimationConfig, useSharedValue} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import attachmentModalHandler from '@libs/AttachmentModalHandler';
import fileDownload from '@libs/fileDownload';
import {getFileName} from '@libs/fileDownload/FileUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getOriginalMessage, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {hasEReceipt, hasMissingSmartscanFields, hasReceipt, hasReceiptSource, isReceiptBeingScanned} from '@libs/TransactionUtils';
import type {AvatarSource} from '@libs/UserUtils';
import variables from '@styles/variables';
import {detachReceipt} from '@userActions/IOU';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import viewRef from '@src/types/utils/viewRef';
import AttachmentCarousel from './Attachments/AttachmentCarousel';
import AttachmentCarouselPagerContext from './Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import AttachmentView from './Attachments/AttachmentView';
import useAttachmentErrors from './Attachments/AttachmentView/useAttachmentErrors';
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

type ChildrenProps = {
    show: () => void;
};

type AttachmentModalProps = {
    /** Optional source (URL, SVG function) for the image shown. If not passed in via props must be specified when modal is opened. */
    source?: AvatarSource;

    /** The id of the attachment. */
    attachmentID?: string;

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

    /** The ID of the current report */
    reportID?: string;

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

    /** The iou action of the expense creation flow of which we are displaying the receipt for. */
    iouAction?: IOUAction;

    /** The iou type of the expense creation flow of which we are displaying the receipt for. */
    iouType?: IOUType;

    /** The id of the draft transaction linked to the receipt. */
    draftTransactionID?: string;

    fallbackSource?: AvatarSource;

    canEditReceipt?: boolean;

    canDeleteReceipt?: boolean;

    shouldDisableSendButton?: boolean;

    attachmentLink?: string;

    shouldHandleNavigationBack?: boolean;
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
    reportID,
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
    canDeleteReceipt = false,
    onModalClose = () => {},
    isLoading = false,
    shouldShowNotFoundPage = false,
    type = undefined,
    attachmentID,
    accountID = undefined,
    shouldDisableSendButton = false,
    draftTransactionID,
    iouAction,
    iouType: iouTypeProp,
    attachmentLink = '',
    shouldHandleNavigationBack,
}: AttachmentModalProps) {
    const styles = useThemeStyles();
    const [isModalOpen, setIsModalOpen] = useState(defaultOpen);
    const [shouldLoadAttachment, setShouldLoadAttachment] = useState(false);
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [isDeleteReceiptConfirmModalVisible, setIsDeleteReceiptConfirmModalVisible] = useState(false);
    const [isAuthTokenRequiredState, setIsAuthTokenRequiredState] = useState(isAuthTokenRequired);
    const [attachmentInvalidReasonTitle, setAttachmentInvalidReasonTitle] = useState<TranslationPaths | null>(null);
    const [attachmentInvalidReason, setAttachmentInvalidReason] = useState<TranslationPaths | null>(null);
    const [sourceState, setSourceState] = useState<AvatarSource>(() => source);
    const [isConfirmButtonDisabled, setIsConfirmButtonDisabled] = useState(false);
    const [isDownloadButtonReadyToBeShown, setIsDownloadButtonReadyToBeShown] = React.useState(true);
    const isPDFLoadError = useRef(false);
    const isReplaceReceipt = useRef(false);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const nope = useSharedValue(false);
    const isOverlayModalVisible = (isReceiptAttachment && isDeleteReceiptConfirmModalVisible) || (!isReceiptAttachment && isAttachmentInvalid);
    const iouType = useMemo(() => iouTypeProp ?? (isTrackExpenseAction ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT), [isTrackExpenseAction, iouTypeProp]);
    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const transactionID = (isMoneyRequestAction(parentReportAction) && getOriginalMessage(parentReportAction)?.IOUTransactionID) || CONST.DEFAULT_NUMBER_ID;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: true});
    const [currentAttachmentLink, setCurrentAttachmentLink] = useState(attachmentLink);
    const {setAttachmentError, isErrorInAttachment, clearAttachmentErrors} = useAttachmentErrors();

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
            fileDownload(sourceURL, fileName ?? '', undefined, undefined, undefined, undefined, undefined, !draftTransactionID);
        }

        // At ios, if the keyboard is open while opening the attachment, then after downloading
        // the attachment keyboard will show up. So, to fix it we need to dismiss the keyboard.
        Keyboard.dismiss();
    }, [isAuthTokenRequiredState, sourceState, file, type, draftTransactionID]);

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
        detachReceipt(transaction?.transactionID);
        setIsDeleteReceiptConfirmModalVisible(false);
        Navigation.goBack();
    }, [transaction]);

    /**
     * Closes the modal.
     * @param {boolean} [shouldCallDirectly] If true, directly calls `onModalClose`.
     * This is useful when you plan to continue navigating to another page after closing the modal, to avoid freezing the app due to navigating to another page first and dismissing the modal later.
     * If `shouldCallDirectly` is false or undefined, it calls `attachmentModalHandler.handleModalClose` to close the modal.
     * This ensures smooth modal closing behavior without causing delays in closing.
     */
    const closeModal = useCallback(
        (shouldCallDirectly?: boolean) => {
            setIsModalOpen(false);

            if (typeof onModalClose === 'function') {
                if (shouldCallDirectly) {
                    onModalClose();
                    return;
                }
                attachmentModalHandler.handleModalClose(onModalClose);
            }

            // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        },
        [onModalClose],
    );

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
            // linter keep complain about accessing ref during render
            // eslint-disable-next-line react-compiler/react-compiler
            menuItems.push({
                icon: Expensicons.Camera,
                text: translate('common.replace'),
                onSelected: () => {
                    closeModal(true);
                    // Set the ref to true, so when the modal is hidden, we will navigate to the scan receipt screen
                    isReplaceReceipt.current = true;
                },
            });
        }
        if ((!isOffline && allowDownload && !isLocalSource) || !!draftTransactionID) {
            menuItems.push({
                icon: Expensicons.Download,
                text: translate('common.download'),
                onSelected: () => downloadAttachment(),
            });
        }

        const hasOnlyEReceipt = hasEReceipt(transaction) && !hasReceiptSource(transaction);
        if (!hasOnlyEReceipt && hasReceipt(transaction) && !isReceiptBeingScanned(transaction) && canDeleteReceipt && !hasMissingSmartscanFields(transaction)) {
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

    const headerTitleNew = headerTitle ?? translate(isReceiptAttachment ? 'common.receipt' : 'common.attachment');
    const shouldShowThreeDotsButton = isReceiptAttachment && isModalOpen && threeDotsMenuItems.length !== 0;
    let shouldShowDownloadButton = false;
    if ((!isEmptyObject(report) || type === CONST.ATTACHMENT_TYPE.SEARCH) && !isErrorInAttachment(sourceState)) {
        shouldShowDownloadButton = allowDownload && isDownloadButtonReadyToBeShown && !shouldShowNotFoundPage && !isReceiptAttachment && !isOffline && !isLocalSource;
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
            onAttachmentError: setAttachmentError,
        }),
        [closeModal, setAttachmentError, nope, sourceForAttachmentView],
    );

    const submitRef = useRef<View | HTMLElement>(null);

    return (
        <>
            <Modal
                type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
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
                    clearAttachmentErrors();
                    if (isPDFLoadError.current) {
                        setIsAttachmentInvalid(true);
                        setAttachmentInvalidReasonTitle('attachmentPicker.attachmentError');
                        setAttachmentInvalidReason('attachmentPicker.errorWhileSelectingCorruptedAttachment');
                        return;
                    }

                    if (isReplaceReceipt.current) {
                        // eslint-disable-next-line @typescript-eslint/no-deprecated
                        InteractionManager.runAfterInteractions(() => {
                            Navigation.navigate(
                                ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(
                                    iouAction ?? CONST.IOU.ACTION.EDIT,
                                    iouType,
                                    draftTransactionID ?? transaction?.transactionID,
                                    report?.reportID,
                                    Navigation.getActiveRoute(),
                                ),
                            );
                        });
                    }
                }}
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
                        shouldShowDownloadButton={shouldShowDownloadButton}
                        onDownloadButtonPress={() => downloadAttachment()}
                        shouldShowCloseButton={!shouldUseNarrowLayout}
                        shouldShowBackButton={shouldUseNarrowLayout}
                        onBackButtonPress={closeModal}
                        onCloseButtonPress={closeModal}
                        shouldShowThreeDotsButton={shouldShowThreeDotsButton}
                        threeDotsAnchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                        }}
                        shouldSetModalVisibility={false}
                        threeDotsMenuItems={threeDotsMenuItems}
                        shouldOverlayDots
                        subTitleLink={currentAttachmentLink ?? ''}
                        shouldDisplayHelpButton={false}
                    />
                    <View style={styles.imageModalImageCenterContainer}>
                        {isLoading && <FullScreenLoadingIndicator testID="attachment-loading-spinner" />}
                        {shouldShowNotFoundPage && !isLoading && (
                            <BlockingView
                                icon={Illustrations.ToddBehindCloud}
                                iconWidth={variables.modalTopIconWidth}
                                iconHeight={variables.modalTopIconHeight}
                                title={translate('notFound.notHere')}
                                subtitle={translate('notFound.pageNotFound')}
                                linkTranslationKey="notFound.goBackHome"
                                onLinkPress={() => Navigation.dismissModal()}
                            />
                        )}
                        {!shouldShowNotFoundPage &&
                            !isLoading &&
                            // We shouldn't show carousel arrow in search result attachment
                            (!isEmptyObject(report) && !isReceiptAttachment && type !== CONST.ATTACHMENT_TYPE.SEARCH ? (
                                <AttachmentCarousel
                                    accountID={accountID}
                                    type={type}
                                    attachmentID={attachmentID}
                                    report={report}
                                    onNavigate={onNavigate}
                                    onSwipeDown={closeModal}
                                    source={source}
                                    setDownloadButtonVisibility={setDownloadButtonVisibility}
                                    attachmentLink={currentAttachmentLink}
                                    onAttachmentError={setAttachmentError}
                                />
                            ) : (
                                !!sourceForAttachmentView &&
                                shouldLoadAttachment && (
                                    <AttachmentCarouselPagerContext.Provider value={context}>
                                        <AttachmentView
                                            containerStyles={[styles.mh5]}
                                            source={sourceForAttachmentView}
                                            isAuthTokenRequired={isAuthTokenRequiredState}
                                            file={file}
                                            onToggleKeyboard={setIsConfirmButtonDisabled}
                                            onPDFLoadError={() => {
                                                isPDFLoadError.current = true;
                                                closeModal();
                                            }}
                                            isWorkspaceAvatar={isWorkspaceAvatar}
                                            maybeIcon={maybeIcon}
                                            fallbackSource={fallbackSource}
                                            isUsedInAttachmentModal
                                            transactionID={transaction?.transactionID}
                                            isUploaded={!isEmptyObject(report)}
                                            reportID={reportID ?? (!isEmptyObject(report) ? report.reportID : undefined)}
                                        />
                                    </AttachmentCarouselPagerContext.Provider>
                                )
                            ))}
                    </View>
                    {/* If we have an onConfirm method show a confirmation button */}
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

            {children?.({show: openModal})}
        </>
    );
}

AttachmentModal.displayName = 'AttachmentModal';

export default memo(AttachmentModal);
