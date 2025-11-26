import React, {memo, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Animated, {FadeIn, LayoutAnimationConfig, useSharedValue} from 'react-native-reanimated';
import AttachmentCarousel from '@components/Attachments/AttachmentCarousel';
import AttachmentCarouselPagerContext from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import AttachmentView from '@components/Attachments/AttachmentView';
import useAttachmentErrors from '@components/Attachments/AttachmentView/useAttachmentErrors';
import type {Attachment} from '@components/Attachments/types';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderGap from '@components/HeaderGap';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import {getOriginalMessage, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import viewRef from '@src/types/utils/viewRef';
import {AttachmentStateContext} from './AttachmentStateContextProvider';
import type {AttachmentModalBaseContentProps} from './types';

function AttachmentModalBaseContent({
    source: sourceProp = '',
    fallbackSource,
    file: filesProp,
    fileToDisplayIndex = 0,
    originalFileName = '',
    attachmentID,
    isAuthTokenRequired = false,
    maybeIcon = false,
    type,
    accountID,
    attachmentLink = '',
    report,
    reportID,
    isWorkspaceAvatar = false,
    headerTitle,
    threeDotsMenuItems: threeDotsMenuItemsProp,
    isLoading = false,
    shouldShowNotFoundPage = false,
    shouldShowCarousel = true,
    shouldDisableSendButton = false,
    shouldDisplayHelpButton = false,
    submitRef,
    onDownloadAttachment,
    onClose,
    onConfirm,
    AttachmentContent,
    onCarouselAttachmentChange = () => {},
    transaction: transactionProp,
    shouldCloseOnSwipeDown = false,
}: AttachmentModalBaseContentProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const illustrations = useMemoizedLazyIllustrations(['ToddBehindCloud']);

    // This logic is used to ensure that the source is updated when the source changes and
    // that the initially provided source is always used as a fallback.
    const [source, setSource] = useState<AvatarSource>(() => sourceProp);
    const isLocalSource = typeof source === 'string' && /^file:|^blob:/.test(source);
    const sourceForAttachmentView = source || sourceProp;
    useEffect(() => {
        setSource(() => sourceProp);
    }, [sourceProp]);

    const [isAuthTokenRequiredState, setIsAuthTokenRequiredState] = useState(isAuthTokenRequired);
    useEffect(() => {
        setIsAuthTokenRequiredState(isAuthTokenRequired);
    }, [isAuthTokenRequired]);

    const [isConfirmButtonDisabled, setIsConfirmButtonDisabled] = useState(false);
    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    const transactionID = (isMoneyRequestAction(parentReportAction) && getOriginalMessage(parentReportAction)?.IOUTransactionID) ?? CONST.DEFAULT_NUMBER_ID;
    const [transactionFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: true});
    const transaction = transactionProp ?? transactionFromOnyx;
    const [currentAttachmentLink, setCurrentAttachmentLink] = useState(attachmentLink);

    const fallbackFile = useMemo(() => (originalFileName ? {name: originalFileName} : undefined), [originalFileName]);
    const [files, setFilesInternal] = useState<FileObject | FileObject[] | undefined>(() => filesProp ?? fallbackFile);
    const [isMultipleFiles, setIsMultipleFiles] = useState<boolean>(() => Array.isArray(files));
    const fileToDisplay = useMemo(() => {
        if (isMultipleFiles) {
            return (files as FileObject[])?.at(fileToDisplayIndex);
        }
        return files as FileObject;
    }, [files, fileToDisplayIndex, isMultipleFiles]);

    const setFile = useCallback((newFile: FileObject | FileObject[] | undefined) => {
        if (Array.isArray(newFile)) {
            setFilesInternal(newFile);
            setIsMultipleFiles(true);
        } else {
            setFilesInternal(newFile);
            setIsMultipleFiles(false);
        }
    }, []);

    useEffect(() => {
        setFile(filesProp ?? fallbackFile);
    }, [filesProp, fallbackFile, setFile]);

    /**
     * Keeps the attachment source in sync with the attachment displayed currently in the carousel.
     */
    const onNavigate = useCallback(
        (attachment: Attachment) => {
            setSource(attachment.source);
            setFile(attachment.file);
            setIsAuthTokenRequiredState(attachment.isAuthTokenRequired ?? false);
            onCarouselAttachmentChange(attachment);
            setCurrentAttachmentLink(attachment?.attachmentLink ?? '');
        },
        [onCarouselAttachmentChange, setFile],
    );

    const threeDotsMenuItems = useMemo(
        () => (typeof threeDotsMenuItemsProp === 'function' ? threeDotsMenuItemsProp({file: fileToDisplay, source, isLocalSource}) : (threeDotsMenuItemsProp ?? [])),
        [fileToDisplay, isLocalSource, source, threeDotsMenuItemsProp],
    );

    const [isDownloadButtonReadyToBeShown, setIsDownloadButtonReadyToBeShown] = useState(true);
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
     * Execute the onConfirm callback and close the modal.
     */
    const submitAndClose = useCallback(() => {
        // If the modal has already been closed or the confirm button is disabled
        // do not submit.
        if (isConfirmButtonDisabled) {
            return;
        }

        if (onConfirm) {
            onConfirm(Object.assign(files ?? {}, {source} as FileObject));
        }

        onClose?.();
    }, [isConfirmButtonDisabled, onConfirm, onClose, files, source]);

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

    const {setAttachmentError, isErrorInAttachment, clearAttachmentErrors} = useAttachmentErrors();
    useEffect(() => {
        return () => {
            clearAttachmentErrors();
        };
    }, [clearAttachmentErrors]);

    const {isAttachmentLoaded} = useContext(AttachmentStateContext);
    const shouldShowDownloadButton = useMemo(() => {
        const isValidContext = !isEmptyObject(report) || type === CONST.ATTACHMENT_TYPE.SEARCH;
        if (!isValidContext || isErrorInAttachment(source)) {
            return false;
        }

        return !!onDownloadAttachment && isDownloadButtonReadyToBeShown && !shouldShowNotFoundPage && !isOffline && !isLocalSource && isAttachmentLoaded?.(source);
    }, [isAttachmentLoaded, isDownloadButtonReadyToBeShown, isErrorInAttachment, isLocalSource, isOffline, onDownloadAttachment, report, shouldShowNotFoundPage, source, type]);

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
            onAttachmentError: setAttachmentError,
            ...(shouldCloseOnSwipeDown ? {onSwipeDown: onClose} : {}),
        }),
        [falseSV, sourceForAttachmentView, setAttachmentError, shouldCloseOnSwipeDown, onClose],
    );

    const shouldDisplayContent = !shouldShowNotFoundPage && !isLoading;
    const Content = useMemo(() => {
        if (AttachmentContent) {
            return (
                <AttachmentContent
                    fileToDisplay={fileToDisplay}
                    files={files}
                />
            );
        }

        return !isEmptyObject(report) && shouldShowCarousel && type !== CONST.ATTACHMENT_TYPE.SEARCH ? (
            <AttachmentCarousel
                accountID={accountID}
                type={type}
                attachmentID={attachmentID}
                report={report}
                onNavigate={onNavigate}
                source={sourceProp}
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
                        file={fileToDisplay}
                        onToggleKeyboard={setIsConfirmButtonDisabled}
                        isWorkspaceAvatar={isWorkspaceAvatar}
                        maybeIcon={maybeIcon}
                        fallbackSource={fallbackSource}
                        isUsedInAttachmentModal
                        transactionID={transaction?.transactionID}
                        transaction={transaction}
                        isUploaded={!isEmptyObject(report)}
                        reportID={reportID ?? (!isEmptyObject(report) ? report.reportID : undefined)}
                    />
                </AttachmentCarouselPagerContext.Provider>
            )
        );
    }, [
        AttachmentContent,
        accountID,
        attachmentID,
        context,
        currentAttachmentLink,
        fallbackSource,
        fileToDisplay,
        files,
        isAuthTokenRequiredState,
        isWorkspaceAvatar,
        maybeIcon,
        onNavigate,
        report,
        reportID,
        setAttachmentError,
        setDownloadButtonVisibility,
        shouldShowCarousel,
        sourceForAttachmentView,
        sourceProp,
        styles.mh5,
        transaction,
        type,
    ]);

    return (
        <GestureHandlerRootView style={styles.flex1}>
            {shouldUseNarrowLayout && <HeaderGap />}
            <HeaderWithBackButton
                shouldMinimizeMenuButton
                title={headerTitle ?? translate('common.attachment')}
                shouldShowBorderBottom
                shouldShowDownloadButton={shouldShowDownloadButton}
                shouldDisplayHelpButton={shouldDisplayHelpButton}
                onDownloadButtonPress={() => onDownloadAttachment?.({file: fileToDisplay, source})}
                shouldShowCloseButton={!shouldUseNarrowLayout}
                shouldShowBackButton={shouldUseNarrowLayout}
                onBackButtonPress={onClose}
                onCloseButtonPress={onClose}
                shouldShowThreeDotsButton={threeDotsMenuItems.length > 0}
                threeDotsMenuItems={threeDotsMenuItems}
                threeDotsAnchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
                shouldSetModalVisibility={false}
                shouldOverlayDots
                subTitleLink={currentAttachmentLink ?? ''}
            />
            <View style={styles.imageModalImageCenterContainer}>
                {isLoading && <FullScreenLoadingIndicator testID="attachment-loading-spinner" />}
                {shouldShowNotFoundPage && !isLoading && (
                    <BlockingView
                        icon={illustrations.ToddBehindCloud}
                        iconWidth={variables.modalTopIconWidth}
                        iconHeight={variables.modalTopIconHeight}
                        title={translate('notFound.notHere')}
                        subtitle={translate('notFound.pageNotFound')}
                        linkTranslationKey="notFound.goBackHome"
                        onLinkPress={onClose}
                    />
                )}
                {shouldDisplayContent && Content}
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
        </GestureHandlerRootView>
    );
}
AttachmentModalBaseContent.displayName = 'AttachmentModalBaseContent';

export default memo(AttachmentModalBaseContent);
