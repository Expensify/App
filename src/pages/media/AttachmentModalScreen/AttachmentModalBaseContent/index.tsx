import React, {memo, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, Keyboard, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Animated, {FadeIn, LayoutAnimationConfig, useSharedValue} from 'react-native-reanimated';
import AttachmentCarousel from '@components/Attachments/AttachmentCarousel';
import AttachmentCarouselPagerContext from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import AttachmentView from '@components/Attachments/AttachmentView';
import useAttachmentErrors from '@components/Attachments/AttachmentView/useAttachmentErrors';
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
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import fileDownload from '@libs/fileDownload';
import {getFileName} from '@libs/fileDownload/FileUtils';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';
import {getOriginalMessage, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {hasEReceipt, hasMissingSmartscanFields, hasReceipt, hasReceiptSource, isReceiptBeingScanned} from '@libs/TransactionUtils';
import type {AvatarSource} from '@libs/UserUtils';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import variables from '@styles/variables';
import {detachReceipt} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import viewRef from '@src/types/utils/viewRef';
import {AttachmentStateContext} from './AttachmentStateContextProvider';
import type {AttachmentModalBaseContentProps} from './types';

function AttachmentModalBaseContent({
    source = '',
    attachmentID,
    fallbackSource,
    file: fileProp,
    originalFileName = '',
    isAuthTokenRequired = false,
    maybeIcon = false,
    headerTitle: headerTitleProp,
    type,
    draftTransactionID,
    iouAction,
    iouType: iouTypeProp,
    accountID,
    attachmentLink = '',
    allowDownload = false,
    isTrackExpenseAction = false,
    report,
    reportID,
    isReceiptAttachment = false,
    isWorkspaceAvatar = false,
    canEditReceipt = false,
    canDeleteReceipt = false,
    isLoading = false,
    shouldShowNotFoundPage = false,
    shouldDisableSendButton = false,
    shouldDisplayHelpButton = true,
    isDeleteReceiptConfirmModalVisible = false,
    isAttachmentInvalid = false,
    attachmentInvalidReason,
    attachmentInvalidReasonTitle,
    submitRef,
    onClose,
    onConfirm,
    onConfirmModalClose,
    onRequestDeleteReceipt,
    onDeleteReceipt,
    onCarouselAttachmentChange = () => {},
    onValidateFile,
}: AttachmentModalBaseContentProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    // This logic is used to ensure that the source is updated when the source changes and
    // that the initially provided source is always used as a fallback.
    const [sourceState, setSourceState] = useState<AvatarSource>(() => source);
    const sourceForAttachmentView = sourceState || source;
    useEffect(() => {
        setSourceState(() => source);
    }, [source]);

    const [isAuthTokenRequiredState, setIsAuthTokenRequiredState] = useState(isAuthTokenRequired);
    useEffect(() => {
        setIsAuthTokenRequiredState(isAuthTokenRequired);
    }, [isAuthTokenRequired]);

    const [isConfirmButtonDisabled, setIsConfirmButtonDisabled] = useState(false);
    const [isDownloadButtonReadyToBeShown, setIsDownloadButtonReadyToBeShown] = React.useState(true);
    const iouType = useMemo(() => iouTypeProp ?? (isTrackExpenseAction ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT), [isTrackExpenseAction, iouTypeProp]);
    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const transactionID = (isMoneyRequestAction(parentReportAction) && getOriginalMessage(parentReportAction)?.IOUTransactionID) || CONST.DEFAULT_NUMBER_ID;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: true});
    const [currentAttachmentLink, setCurrentAttachmentLink] = useState(attachmentLink);

    const {setAttachmentError, isErrorInAttachment, clearAttachmentErrors} = useAttachmentErrors();
    useEffect(() => {
        return () => {
            clearAttachmentErrors();
        };
    }, [clearAttachmentErrors]);

    const fallbackFile = useMemo(() => (originalFileName ? {name: originalFileName} : undefined), [originalFileName]);
    const [file, setFile] = useState<FileObject | undefined>(() => fileProp ?? fallbackFile);
    useEffect(() => {
        if (!fileProp) {
            return;
        }

        if (onValidateFile) {
            onValidateFile?.(fileProp, setFile);
        } else {
            setFile(fileProp ?? fallbackFile);
        }
    }, [fileProp, fallbackFile, onValidateFile]);

    useEffect(() => {
        setFile(fallbackFile);
    }, [fallbackFile]);

    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const isLocalSource = typeof sourceState === 'string' && /^file:|^blob:/.test(sourceState);

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
    }, [sourceState, isAuthTokenRequiredState, type, file?.name, draftTransactionID]);

    /**
     * Execute the onConfirm callback and close the modal.
     */
    const submitAndClose = useCallback(() => {
        // If the modal has already been closed or the confirm button is disabled
        // do not submit.
        if (isConfirmButtonDisabled) {
            return;
        }

        if (onConfirm) {
            onConfirm(Object.assign(file ?? {}, {source: sourceState} as FileObject));
        }

        onClose?.();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isConfirmButtonDisabled, onConfirm, file, sourceState]);

    /**
     * Detach the receipt and close the modal.
     */
    const deleteAndCloseModal = useCallback(() => {
        detachReceipt(transaction?.transactionID);
        onDeleteReceipt?.();
        onClose?.();
    }, [onClose, onDeleteReceipt, transaction?.transactionID]);

    // Close the modal when the escape key is pressed
    useEffect(() => {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.ESCAPE;
        const unsubscribeEscapeKey = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => {
                onClose?.();
            },
            shortcutConfig.descriptionKey,
            shortcutConfig.modifiers,
            true,
            true,
        );

        return unsubscribeEscapeKey;
    }, [onClose]);

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
                    const goToScanScreen = () => {
                        // eslint-disable-next-line deprecation/deprecation
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
                    };

                    onClose?.({shouldCallDirectly: true, onAfterClose: goToScanScreen});
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
                onSelected: onRequestDeleteReceipt,
                shouldCallAfterModalHide: true,
            });
        }
        return menuItems;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isReceiptAttachment, transaction, file, sourceState, iouType]);

    // There are a few things that shouldn't be set until we absolutely know if the file is a receipt or an attachment.
    // props.isReceiptAttachment will be null until its certain what the file is, in which case it will then be true|false.
    const headerTitle = useMemo(() => headerTitleProp ?? translate(isReceiptAttachment ? 'common.receipt' : 'common.attachment'), [headerTitleProp, isReceiptAttachment, translate]);
    const shouldShowThreeDotsButton = useMemo(() => isReceiptAttachment && threeDotsMenuItems.length !== 0, [isReceiptAttachment, threeDotsMenuItems.length]);

    const {isAttachmentLoaded} = useContext(AttachmentStateContext);
    const shouldShowDownloadButton = useMemo(() => {
        if ((!isEmptyObject(report) || type === CONST.ATTACHMENT_TYPE.SEARCH) && !isErrorInAttachment(sourceState)) {
            return allowDownload && isDownloadButtonReadyToBeShown && !shouldShowNotFoundPage && !isReceiptAttachment && !isOffline && !isLocalSource && isAttachmentLoaded?.(sourceState);
        }
        return false;
    }, [
        allowDownload,
        isDownloadButtonReadyToBeShown,
        isErrorInAttachment,
        isLocalSource,
        isOffline,
        isReceiptAttachment,
        report,
        shouldShowNotFoundPage,
        sourceState,
        type,
        isAttachmentLoaded,
    ]);

    const isPDFLoadError = useRef(false);
    const onPdfLoadError = useCallback(() => {
        isPDFLoadError.current = true;
        onClose?.();
    }, [isPDFLoadError, onClose]);

    const onInvalidReasonModalHide = useCallback(() => {
        if (!isPDFLoadError.current) {
            return;
        }
        isPDFLoadError.current = false;
    }, [isPDFLoadError]);

    // We need to pass a shared value of type boolean to the context, so `falseSV` acts as a default value.
    const falseSV = useSharedValue(false);
    const context = useMemo(
        () => ({
            pagerItems: [{source: sourceForAttachmentView, index: 0, isActive: true}],
            activePage: 0,
            pagerRef: undefined,
            isPagerScrolling: falseSV,
            isScrollEnabled: falseSV,
            onTap: () => {},
            onScaleChanged: () => {},
            onSwipeDown: onClose,
            onAttachmentError: setAttachmentError,
        }),
        [onClose, falseSV, sourceForAttachmentView, setAttachmentError],
    );

    return (
        <>
            <GestureHandlerRootView style={styles.flex1}>
                {shouldUseNarrowLayout && <HeaderGap />}
                <HeaderWithBackButton
                    shouldMinimizeMenuButton
                    title={headerTitle}
                    shouldShowBorderBottom
                    shouldShowDownloadButton={shouldShowDownloadButton}
                    shouldDisplayHelpButton={shouldDisplayHelpButton}
                    onDownloadButtonPress={() => downloadAttachment()}
                    shouldShowCloseButton={!shouldUseNarrowLayout}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={onClose}
                    onCloseButtonPress={onClose}
                    shouldShowThreeDotsButton={shouldShowThreeDotsButton}
                    threeDotsAnchorAlignment={{
                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                    }}
                    shouldSetModalVisibility={false}
                    threeDotsMenuItems={threeDotsMenuItems}
                    shouldOverlayDots
                    subTitleLink={currentAttachmentLink ?? ''}
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
                            onLinkPress={onClose}
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
                                onClose={onClose}
                                source={source}
                                setDownloadButtonVisibility={setDownloadButtonVisibility}
                                attachmentLink={currentAttachmentLink}
                                onAttachmentError={setAttachmentError}
                            />
                        ) : (
                            !!sourceForAttachmentView && (
                                <AttachmentCarouselPagerContext.Provider value={context}>
                                    <AttachmentView
                                        containerStyles={[styles.mh5]}
                                        source={sourceForAttachmentView}
                                        isAuthTokenRequired={isAuthTokenRequiredState}
                                        file={file}
                                        onToggleKeyboard={setIsConfirmButtonDisabled}
                                        onPDFLoadError={() => onPdfLoadError?.()}
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
                {!!onConfirm && !isConfirmButtonDisabled && (
                    <LayoutAnimationConfig skipEntering>
                        {!!onConfirm && !isConfirmButtonDisabled && (
                            <SafeAreaConsumer>
                                {({safeAreaPaddingBottomStyle}) => (
                                    <Animated.View
                                        style={safeAreaPaddingBottomStyle}
                                        entering={FadeIn}
                                    >
                                        <Button
                                            ref={submitRef ? viewRef(submitRef) : undefined}
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
                )}
                {isReceiptAttachment && (
                    <ConfirmModal
                        title={translate('receipt.deleteReceipt')}
                        isVisible={isDeleteReceiptConfirmModalVisible}
                        onConfirm={deleteAndCloseModal}
                        onCancel={onConfirmModalClose}
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
                    onConfirm={() => onConfirmModalClose?.()}
                    onCancel={onConfirmModalClose}
                    isVisible={isAttachmentInvalid}
                    prompt={attachmentInvalidReason ? translate(attachmentInvalidReason) : ''}
                    confirmText={translate('common.close')}
                    shouldShowCancelButton={false}
                    onModalHide={onInvalidReasonModalHide}
                />
            )}
        </>
    );
}
AttachmentModalBaseContent.displayName = 'AttachmentModalBaseContent';

export default memo(AttachmentModalBaseContent);

export type {AttachmentModalBaseContentProps};
