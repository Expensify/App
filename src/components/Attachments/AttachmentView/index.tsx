import {Str} from 'expensify-common';
import React, {memo, useContext, useEffect, useState} from 'react';
import type {GestureResponderEvent, ImageURISource, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import AttachmentCarouselPagerContext from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import type {Attachment, AttachmentSource} from '@components/Attachments/types';
import Button from '@components/Button';
import DistanceEReceipt from '@components/DistanceEReceipt';
import EReceipt from '@components/EReceipt';
import Icon from '@components/Icon';
import PerDiemEReceipt from '@components/PerDiemEReceipt';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useFirstRenderRoute from '@hooks/useFirstRenderRoute';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {add as addCachedPDFPaths} from '@libs/actions/CachedPDFPaths';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {getFileResolution, isHighResolutionImage} from '@libs/fileDownload/FileUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {hasEReceipt, hasReceiptSource, isDistanceRequest, isManualDistanceRequest, isPerDiemRequest} from '@libs/TransactionUtils';
import type {ColorValue} from '@styles/utils/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import SafeString from '@src/utils/SafeString';
import AttachmentViewImage from './AttachmentViewImage';
import AttachmentViewPdf from './AttachmentViewPdf';
import AttachmentViewVideo from './AttachmentViewVideo';
import DefaultAttachmentView from './DefaultAttachmentView';
import HighResolutionInfo from './HighResolutionInfo';

type AttachmentViewProps = Attachment & {
    /** Whether this view is the active screen  */
    isFocused?: boolean;

    /** Function for handle on press */
    onPress?: (e?: GestureResponderEvent | KeyboardEvent) => void;

    /** Whether the attachment is used in attachment modal */
    isUsedInAttachmentModal?: boolean;

    /** Flag to show/hide download icon */
    shouldShowDownloadIcon?: boolean;

    /** Flag to show the loading indicator */
    shouldShowLoadingSpinnerIcon?: boolean;

    /** Notify parent that the UI should be modified to accommodate keyboard */
    onToggleKeyboard?: (shouldFadeOut: boolean) => void;

    /** A callback when the PDF fails to load */
    onPDFLoadError?: () => void;

    /** Extra styles to pass to View wrapper */
    containerStyles?: StyleProp<ViewStyle>;

    /** Denotes whether it is a workspace avatar or not */
    isWorkspaceAvatar?: boolean;

    /** Denotes whether it is an icon (ex: SVG) */
    maybeIcon?: boolean;

    /** Fallback source to use in case of error */
    fallbackSource?: AttachmentSource;

    /* Whether it is hovered or not */
    isHovered?: boolean;

    /** Whether the attachment is used as a chat attachment */
    isUsedAsChatAttachment?: boolean;

    /* Flag indicating whether the attachment has been uploaded. */
    isUploaded?: boolean;

    /** Whether the attachment is deleted */
    isDeleted?: boolean;

    /** Flag indicating if the attachment is being uploaded. */
    isUploading?: boolean;

    /** The reportID related to the attachment */
    reportID?: string;

    /** Transaction object. When provided, will be used instead of fetching from Onyx. */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;
};

function checkIsFileImage(source: string | number | ImageURISource | ImageURISource[], fileName: string | undefined) {
    const isSourceImage = typeof source === 'number' || (typeof source === 'string' && Str.isImage(source));

    const isFileNameImage = fileName && Str.isImage(fileName);

    return isSourceImage || isFileNameImage;
}

function AttachmentView({
    attachmentID,
    source,
    previewSource,
    file,
    isAuthTokenRequired,
    onPress,
    shouldShowLoadingSpinnerIcon,
    shouldShowDownloadIcon,
    containerStyles,
    onToggleKeyboard,
    onPDFLoadError: onPDFLoadErrorProp = () => {},
    isFocused,
    isUsedInAttachmentModal,
    isWorkspaceAvatar,
    maybeIcon,
    fallbackSource,
    transactionID = '-1',
    reportActionID,
    isHovered,
    duration,
    isUsedAsChatAttachment,
    isUploaded = true,
    isDeleted,
    isUploading = false,
    reportID,
    transaction: transactionProp,
}: AttachmentViewProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowCircleClockwise', 'Gallery']);
    const [transactionFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});
    const transaction = transactionProp ?? transactionFromOnyx;
    const {translate} = useLocalize();
    const {updateCurrentURLAndReportID, currentlyPlayingURL, playVideo} = usePlaybackContext();

    const attachmentCarouselPagerContext = useContext(AttachmentCarouselPagerContext);
    const {onAttachmentError, onTap} = attachmentCarouselPagerContext ?? {};
    const theme = useTheme();
    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [loadComplete, setLoadComplete] = useState(false);
    const [isHighResolution, setIsHighResolution] = useState<boolean>(false);
    const [hasPDFFailedToLoad, setHasPDFFailedToLoad] = useState(false);
    const isVideo = (typeof source === 'string' && Str.isVideo(source)) || (file?.name && Str.isVideo(file.name));
    const firstRenderRoute = useFirstRenderRoute();
    const isInFocusedModal = firstRenderRoute.isFocused && isFocused === undefined;

    useEffect(() => {
        if (!isFocused && !isInFocusedModal && !(file && isUsedInAttachmentModal)) {
            return;
        }
        const videoSource = isVideo && typeof source === 'string' ? source : undefined;
        updateCurrentURLAndReportID(videoSource, reportID);
        if (videoSource && currentlyPlayingURL === videoSource) {
            playVideo();
        }
    }, [file, isFocused, isInFocusedModal, isUsedInAttachmentModal, isVideo, reportID, source, updateCurrentURLAndReportID, playVideo, currentlyPlayingURL]);

    const [imageError, setImageError] = useState(false);

    const {isOffline} = useNetwork({onReconnect: () => setImageError(false)});

    useEffect(() => {
        getFileResolution(file).then((resolution) => {
            setIsHighResolution(isHighResolutionImage(resolution));
        });
    }, [file]);

    useEffect(() => {
        const isImageSource = typeof source !== 'function' && !!checkIsFileImage(source, file?.name);
        const isErrorInImage = imageError && (typeof fallbackSource === 'number' || typeof fallbackSource === 'function');
        onAttachmentError?.(source, isErrorInImage && isImageSource);
    }, [fallbackSource, file?.name, imageError, onAttachmentError, source]);

    // Handles case where source is a component (ex: SVG) or a number
    // Number may represent a SVG or an image
    if (typeof source === 'function' || (maybeIcon && typeof source === 'number')) {
        let iconFillColor: ColorValue | undefined = '';
        let additionalStyles: ViewStyle[] = [];
        if (isWorkspaceAvatar && file) {
            const defaultWorkspaceAvatarColor = StyleUtils.getDefaultWorkspaceAvatarColor(file.name ?? '');
            iconFillColor = defaultWorkspaceAvatarColor.fill;
            additionalStyles = [defaultWorkspaceAvatarColor];
        }

        return (
            <Icon
                src={source}
                height={variables.defaultAvatarPreviewSize}
                width={variables.defaultAvatarPreviewSize}
                fill={iconFillColor}
                additionalStyles={additionalStyles}
                enableMultiGestureCanvas
            />
        );
    }

    if (isPerDiemRequest(transaction) && transaction && !hasReceiptSource(transaction)) {
        return <PerDiemEReceipt transactionID={transaction.transactionID} />;
    }

    if (transaction && !hasReceiptSource(transaction) && hasEReceipt(transaction)) {
        return (
            <View style={[styles.flex1, styles.alignItemsCenter]}>
                <ScrollView
                    style={styles.w100}
                    contentContainerStyle={[styles.flexGrow1, styles.justifyContentCenter, styles.alignItemsCenter]}
                >
                    <EReceipt transactionID={transaction.transactionID} />
                </ScrollView>
            </View>
        );
    }

    // Check both source and file.name since PDFs dragged into the text field
    // will appear with a source that is a blob
    const isSourcePDF = typeof source === 'string' && Str.isPDF(source);
    const isFilePDF = file && Str.isPDF(file.name ?? translate('attachmentView.unknownFilename'));
    if (!hasPDFFailedToLoad && !isUploading && (isSourcePDF || isFilePDF)) {
        const encryptedSourceUrl = isAuthTokenRequired ? addEncryptedAuthTokenToURL(source as string) : (source as string);

        const onPDFLoadComplete = (path: string) => {
            const id = (transaction && transaction.transactionID) ?? reportActionID;
            if (path && id) {
                addCachedPDFPaths(id, path);
            }
            if (!loadComplete) {
                setLoadComplete(true);
            }
        };

        const onPDFLoadError = () => {
            setHasPDFFailedToLoad(true);
            onPDFLoadErrorProp();
        };

        // We need the following View component on android native
        // So that the event will propagate properly and
        // the Password protected preview will be shown for pdf attachment we are about to send.
        return (
            <View style={[styles.flex1, styles.attachmentCarouselContainer]}>
                <AttachmentViewPdf
                    file={file}
                    isFocused={isFocused}
                    encryptedSourceUrl={encryptedSourceUrl}
                    onPress={onPress}
                    onToggleKeyboard={onToggleKeyboard}
                    onLoadComplete={onPDFLoadComplete}
                    style={isUsedInAttachmentModal ? styles.imageModalPDF : styles.flex1}
                    isUsedAsChatAttachment={isUsedAsChatAttachment}
                    onLoadError={onPDFLoadError}
                />
            </View>
        );
    }

    if (isDistanceRequest(transaction) && !isManualDistanceRequest(transaction) && transaction) {
        // Distance eReceipts are now generated as a PDF, but to keep it backwards compatible we still show the old eReceipt view for image receipts
        const isImageReceiptSource = checkIsFileImage(source, file?.name);
        if (!hasReceiptSource(transaction) || isImageReceiptSource) {
            return <DistanceEReceipt transaction={transaction} />;
        }
    }

    // For this check we use both source and file.name since temporary file source is a blob
    // both PDFs and images will appear as images when pasted into the text field.
    // We also check for numeric source since this is how static images (used for preview) are represented in RN.

    // isLocalSource checks if the source is blob as that's the type of the temp image coming from mobile web
    const isFileImage = checkIsFileImage(source, file?.name);
    const isLocalSourceImage = typeof source === 'string' && source.startsWith('blob:');

    const isImage = isFileImage ?? isLocalSourceImage;

    if (isImage) {
        if (imageError && (typeof fallbackSource === 'number' || typeof fallbackSource === 'function')) {
            return (
                <View style={[styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <Icon
                        src={fallbackSource}
                        width={variables.iconSizeSuperLarge}
                        height={variables.iconSizeSuperLarge}
                        fill={theme.icon}
                    />
                    <View>
                        <Text style={[styles.notFoundTextHeader]}>{translate('attachmentView.attachmentNotFound')}</Text>
                    </View>
                    <Button
                        text={translate('attachmentView.retry')}
                        icon={icons.ArrowCircleClockwise}
                        onPress={() => {
                            if (isOffline) {
                                return;
                            }
                            setImageError(false);
                        }}
                        sentryLabel={CONST.SENTRY_LABEL.ATTACHMENT_CAROUSEL.RETRY_BUTTON}
                    />
                </View>
            );
        }

        let imageSource = imageError && fallbackSource ? (fallbackSource as string) : (source as string);

        if (isHighResolution) {
            if (!isUploaded) {
                return (
                    <>
                        <View style={[styles.imageModalImageCenterContainer, styles.ph10]}>
                            <DefaultAttachmentView
                                icon={icons.Gallery}
                                fileName={file?.name}
                                shouldShowDownloadIcon={shouldShowDownloadIcon}
                                shouldShowLoadingSpinnerIcon={shouldShowLoadingSpinnerIcon}
                                containerStyles={containerStyles}
                            />
                        </View>
                        <HighResolutionInfo isUploaded={isUploaded} />
                    </>
                );
            }
            imageSource = SafeString(previewSource) || imageSource;
        }

        return (
            <>
                <View style={styles.imageModalImageCenterContainer}>
                    <AttachmentViewImage
                        attachmentID={attachmentID}
                        url={imageSource}
                        file={file}
                        isAuthTokenRequired={isAuthTokenRequired}
                        loadComplete={loadComplete}
                        isImage={isImage}
                        onPress={onPress}
                        onError={() => {
                            if (isOffline) {
                                return;
                            }

                            setImageError(true);
                        }}
                    />
                </View>
                {isHighResolution && (
                    <View style={safeAreaPaddingBottomStyle}>
                        <HighResolutionInfo isUploaded={isUploaded} />
                    </View>
                )}
            </>
        );
    }

    if ((isVideo ?? (file?.name && Str.isVideo(file.name))) && typeof source === 'string') {
        return (
            <AttachmentViewVideo
                source={source}
                shouldUseSharedVideoElement={!CONST.ATTACHMENT_LOCAL_URL_PREFIX.some((prefix) => source.startsWith(prefix))}
                isHovered={isHovered}
                duration={duration}
                reportID={reportID}
                onTap={onTap}
            />
        );
    }

    return (
        <DefaultAttachmentView
            fileName={file?.name}
            shouldShowDownloadIcon={shouldShowDownloadIcon}
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            shouldShowLoadingSpinnerIcon={shouldShowLoadingSpinnerIcon || isUploading}
            containerStyles={containerStyles}
            isDeleted={isDeleted}
            isUploading={isUploading}
        />
    );
}

export default memo(AttachmentView);

export {checkIsFileImage};
export type {AttachmentViewProps};
