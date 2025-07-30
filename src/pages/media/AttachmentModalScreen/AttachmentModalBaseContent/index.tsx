import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useOnyx} from 'react-native-onyx';
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
import * as Illustrations from '@components/Icon/Illustrations';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import {getOriginalMessage, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import type {AvatarSource} from '@libs/UserUtils';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import viewRef from '@src/types/utils/viewRef';
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
    allowDownload = false,
    report,
    reportID,
    isWorkspaceAvatar = false,
    headerTitle,
    threeDotsMenuItems: threeDotsMenuItemsProp,
    isLoading = false,
    shouldShowNotFoundPage = false,
    shouldShowCarousel = true,
    shouldShowDownloadButton: shouldShowDownloadButtonProp = true,
    shouldDisableSendButton = false,
    shouldDisplayHelpButton = true,
    submitRef,
    onDownloadAttachment,
    onClose,
    onConfirm,
    AttachmentContent,
    ExtraModals,
    onCarouselAttachmentChange = () => {},
}: AttachmentModalBaseContentProps) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

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
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const transactionID = (isMoneyRequestAction(parentReportAction) && getOriginalMessage(parentReportAction)?.IOUTransactionID) || CONST.DEFAULT_NUMBER_ID;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: true});
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

    const threeDotsMenuItems = useMemo(() => {
        const menuItems: PopoverMenuItem[] = [];

        threeDotsMenuItemsProp?.forEach((menuItem) => {
            if (typeof menuItem === 'function') {
                const generatedMenuItem = menuItem({file: fileToDisplay, source, isLocalSource});
                if (generatedMenuItem) {
                    menuItems.push(generatedMenuItem);
                }

                return;
            }

            menuItems.push(menuItem);
        });

        return menuItems;
    }, [fileToDisplay, isLocalSource, source, threeDotsMenuItemsProp]);

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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isConfirmButtonDisabled, onConfirm, files, source]);

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
    const shouldShowDownloadButton = useMemo(() => {
        if ((isEmptyObject(report) && type !== CONST.ATTACHMENT_TYPE.SEARCH) || isErrorInAttachment(source)) {
            return false;
        }

        return allowDownload && isDownloadButtonReadyToBeShown && !shouldShowNotFoundPage && !isOffline && !isLocalSource && shouldShowDownloadButtonProp;
    }, [allowDownload, isDownloadButtonReadyToBeShown, isErrorInAttachment, isLocalSource, isOffline, report, shouldShowDownloadButtonProp, shouldShowNotFoundPage, source, type]);

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
                onClose={onClose}
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
        onClose,
        onNavigate,
        report,
        reportID,
        setAttachmentError,
        setDownloadButtonVisibility,
        shouldShowCarousel,
        sourceForAttachmentView,
        sourceProp,
        styles.mh5,
        transaction?.transactionID,
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
                shouldShowThreeDotsButton={threeDotsMenuItems && threeDotsMenuItems.length !== 0}
                threeDotsAnchorPosition={styles.threeDotsPopoverOffsetAttachmentModal(windowWidth)}
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
                        linkKey="notFound.goBackHome"
                        shouldShowLink
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
            {ExtraModals}
        </GestureHandlerRootView>
    );
}
AttachmentModalBaseContent.displayName = 'AttachmentModalBaseContent';

export default memo(AttachmentModalBaseContent);
