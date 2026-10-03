import {useAttachmentCarouselPagerActions} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import MultiGestureIcon from '@components/Attachments/MultiGestureIcon';
import type {Attachment, AttachmentSource} from '@components/Attachments/types';
import Button from '@components/Button';
import EReceipt from '@components/EReceipt';
import Icon from '@components/Icon';
import {useSession} from '@components/OnyxListItemProvider';
import PerDiemEReceipt from '@components/PerDiemEReceipt';
import ScaledDistanceEReceipt from '@components/ScaledDistanceEReceipt';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {usePlaybackActionsContext} from '@components/VideoPlayerContexts/PlaybackContext';

import useCachedAttachmentSource from '@hooks/useCachedAttachmentSource';
import useFirstRenderRoute from '@hooks/useFirstRenderRoute';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportOrReportDraft from '@hooks/useReportOrReportDraft';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {add as addCachedPDFPaths} from '@libs/actions/CachedPDFPaths';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getFileResolution, isHighResolutionImage} from '@libs/fileDownload/FileUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {hasEReceipt, hasReceiptSource, isMapBasedDistanceRequest, isPerDiemRequest} from '@libs/TransactionUtils';

import type {ColorValue} from '@styles/utils/types';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {RotationDegrees} from 'react-fast-pdf';
import type {GestureResponderEvent, ImageURISource, StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {SafeString, Str} from 'expensify-common';
import {Asset} from 'expo-asset';
import React, {memo, useEffect, useState} from 'react';
import {View} from 'react-native';

import AttachmentViewImage from './AttachmentViewImage';
import AttachmentViewPdf from './AttachmentViewPdf';
import AttachmentViewVideo from './AttachmentViewVideo';
import DefaultAttachmentView from './DefaultAttachmentView';
import HighResolutionInfo from './HighResolutionInfo';

type AttachmentViewProps = Attachment & {
    /** Whether this view is the active screen  */
    isFocused?: boolean;

    onPress?: (e?: GestureResponderEvent | KeyboardEvent) => void;
    isUsedInAttachmentModal?: boolean;
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

    isHovered?: boolean;
    isUsedAsChatAttachment?: boolean;
    isUploaded?: boolean;
    isDeleted?: boolean;

    /** Flag indicating if the attachment is being uploaded. */
    isUploading?: boolean;

    /** The reportID related to the attachment */
    reportID?: string;

    /** Transaction object. When provided, will be used instead of fetching from Onyx. */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Controlled rotation angle for the PDF */
    rotation?: RotationDegrees;
};

function checkIsFileImage(source: string | number | ImageURISource | ImageURISource[], fileName: string | undefined, fileType?: string) {
    const isSourceImage = typeof source === 'number' || (typeof source === 'string' && Str.isImage(source));

    const isFileNameImage = !!fileName && Str.isImage(fileName);
    const isFileTypeImage = !!fileType?.startsWith('image/') && Str.isImage(`image.${fileType.slice('image/'.length)}`);

    return isSourceImage || isFileNameImage || isFileTypeImage;
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
    onPDFLoadError: onPDFLoadErrorProp,
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
    rotation,
}: AttachmentViewProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowCircleClockwise', 'Gallery']);
    const [transactionFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);
    const transaction = transactionProp ?? transactionFromOnyx;
    const session = useSession();
    const encryptedAuthToken = session?.encryptedAuthToken ?? '';
    const {translate} = useLocalize();
    const {updateCurrentURLAndReportID} = usePlaybackActionsContext();
    const report = useReportOrReportDraft(reportID);

    const actions = useAttachmentCarouselPagerActions();
    const {onAttachmentError, onTap} = actions ?? {};
    const theme = useTheme();
    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [loadComplete, setLoadComplete] = useState(false);
    const [isHighResolution, setIsHighResolution] = useState<boolean>(false);
    const [hasPDFFailedToLoad, setHasPDFFailedToLoad] = useState(false);
    const [resolvedPDFAsset, setResolvedPDFAsset] = useState<{source: number; uri: string}>();
    const isVideo = (typeof source === 'string' && Str.isVideo(source)) || (file?.name && Str.isVideo(file.name));
    const firstRenderRoute = useFirstRenderRoute();
    const isInFocusedModal = firstRenderRoute.isFocused && isFocused === undefined;

    useEffect(() => {
        // When isFocused is provided (carousel items), it alone decides whether this attachment owns
        // the current URL, so unfocused pages never clobber it. The modal escape hatch only applies
        // to usages that don't track focus (e.g. the single-attachment modal).
        const shouldUpdateCurrentURL = isFocused ?? (isInFocusedModal || !!(file && isUsedInAttachmentModal));
        if (!shouldUpdateCurrentURL) {
            return;
        }
        const videoSource = isVideo && typeof source === 'string' ? source : undefined;
        updateCurrentURLAndReportID(videoSource, report, reportID);
    }, [file, isFocused, isInFocusedModal, isUsedInAttachmentModal, isVideo, reportID, source, updateCurrentURLAndReportID, report]);

    const [imageError, setImageError] = useState(false);

    const cachedSource = useCachedAttachmentSource(attachmentID, typeof source === 'string' ? source : undefined);

    const [prevCachedSource, setPrevCachedSource] = useState(cachedSource);
    if (cachedSource !== prevCachedSource) {
        setPrevCachedSource(cachedSource);
        setImageError(false);
    }

    const {isOffline} = useNetwork({onReconnect: () => setImageError(false)});

    useEffect(() => {
        getFileResolution(file).then((resolution) => {
            setIsHighResolution(isHighResolutionImage(resolution));
        });
    }, [file]);

    useEffect(() => {
        const isImageSource = typeof source !== 'function' && checkIsFileImage(source, file?.name, file?.type);
        const isErrorInImage = imageError && (typeof fallbackSource === 'number' || typeof fallbackSource === 'function');
        onAttachmentError?.(source, isErrorInImage && isImageSource);
    }, [fallbackSource, file?.name, file?.type, imageError, onAttachmentError, source]);

    // Blob PDFs rely on their filename because their source has no extension.
    const isSourcePDF = typeof source === 'string' && Str.isPDF(source);
    const isFilePDF = file && Str.isPDF(file.name ?? translate('attachmentView.unknownFilename'));
    const shouldResolveNonStringPDF =
        typeof source !== 'string' &&
        typeof source !== 'function' &&
        !maybeIcon &&
        !(isPerDiemRequest(transaction) && transaction && !hasReceiptSource(transaction)) &&
        !(transaction && !hasReceiptSource(transaction) && hasEReceipt(transaction)) &&
        !(transaction && isMapBasedDistanceRequest(transaction)) &&
        !hasPDFFailedToLoad &&
        !isUploading &&
        !!isFilePDF &&
        isFocused !== false;

    useEffect(() => {
        if (!shouldResolveNonStringPDF) {
            return;
        }
        let cancelled = false;
        const resolvePDFAsset = async () => {
            let uri: string | undefined;
            try {
                if (typeof source === 'number') {
                    const asset = Asset.fromModule(source);
                    // A PDF filename alone does not establish the registered asset's type.
                    if (asset.type.toLowerCase() === 'pdf') {
                        await asset.downloadAsync();
                        uri = asset.localUri ?? undefined;
                    }
                }
            } catch {
                // Asset lookup or transport failure uses the existing PDF failure transition.
            }
            if (cancelled) {
                return;
            }
            if (typeof source === 'number' && uri) {
                setResolvedPDFAsset({source, uri});
                return;
            }
            setHasPDFFailedToLoad(true);
            onPDFLoadErrorProp?.();
        };
        resolvePDFAsset();
        return () => {
            cancelled = true;
        };
    }, [source, shouldResolveNonStringPDF, onPDFLoadErrorProp]);

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

        if (canUseTouchScreen()) {
            return (
                <MultiGestureIcon
                    src={source}
                    contentSize={{width: variables.avatarPreview, height: variables.avatarPreview}}
                    fill={iconFillColor}
                    additionalStyles={additionalStyles}
                />
            );
        }

        return (
            <Icon
                src={source}
                height={variables.avatarPreview}
                width={variables.avatarPreview}
                fill={iconFillColor}
                additionalStyles={additionalStyles}
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

    // New Expensify builds the distance e-receipt from the expense, which is why the server stores only the route
    // map as the thumbnail for it to draw around. The generated PDF beside it is for Expensify Classic, which
    // cannot build one in the frontend, and it prints the routed trip rather than what the expense bills. Showing
    // that PDF here made the enlarged receipt contradict every other surface, so draw the card instead. This runs
    // before the PDF branch below, which would otherwise return first.
    // See https://github.com/Expensify/Expensify/issues/545298 and https://github.com/Expensify/App/issues/97013.
    if (transaction && isMapBasedDistanceRequest(transaction)) {
        return <ScaledDistanceEReceipt transaction={transaction} />;
    }

    if (!hasPDFFailedToLoad && !isUploading && (isSourcePDF || isFilePDF)) {
        // Every mounted PDF viewer is a full PDF.js document parse (its own worker + parsed document), so in a
        // carousel the memory cost scales with the number of PDF attachments — enough to OOM the WebContent
        // process on iOS Safari and reload the tab when several PDFs are added at once. Only mount the viewer
        // for the item the carousel currently focuses; off-screen items render a lightweight placeholder until
        // they're swiped to. isFocused is undefined outside the carousel (single-attachment hosts), which must
        // keep mounting immediately.
        const numericPDFUri = resolvedPDFAsset?.source === source ? resolvedPDFAsset.uri : undefined;
        const sourceUrl = typeof source === 'string' ? source : numericPDFUri;
        if (isFocused === false || sourceUrl === undefined) {
            return (
                <DefaultAttachmentView
                    fileName={file?.name}
                    shouldShowLoadingSpinnerIcon
                    containerStyles={containerStyles}
                />
            );
        }
        const encryptedSourceUrl = isAuthTokenRequired && typeof source === 'string' ? addEncryptedAuthTokenToURL(sourceUrl, encryptedAuthToken) : sourceUrl;

        const onPDFLoadComplete = (path: string) => {
            const id = transaction?.transactionID ?? reportActionID;
            if (path && id) {
                addCachedPDFPaths(id, path);
            }
            if (!loadComplete) {
                setLoadComplete(true);
            }
        };

        const onPDFLoadError = () => {
            setHasPDFFailedToLoad(true);
            onPDFLoadErrorProp?.();
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
                    isUsedInAttachmentModal={isUsedInAttachmentModal}
                    isUsedAsChatAttachment={isUsedAsChatAttachment}
                    onLoadError={onPDFLoadError}
                    rotation={rotation}
                />
            </View>
        );
    }

    // For this check we use both source and file.name since temporary file source is a blob
    // both PDFs and images will appear as images when pasted into the text field.
    // We also check for numeric source since this is how static images (used for preview) are represented in RN.

    // isLocalSource checks if the source is blob as that's the type of the temp image coming from mobile web
    const isFileImage = checkIsFileImage(source, file?.name, file?.type);
    const isLocalSourceImage = typeof source === 'string' && source.startsWith('blob:');

    const isImage = isFileImage || (!file?.name && isLocalSourceImage);

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
                        onPress={() => {
                            if (isOffline) {
                                return;
                            }
                            setImageError(false);
                        }}
                        sentryLabel={CONST.SENTRY_LABEL.ATTACHMENT_CAROUSEL.RETRY_BUTTON}
                    >
                        <Button.Icon src={icons.ArrowCircleClockwise} />
                        <Button.Text>{translate('attachmentView.retry')}</Button.Text>
                    </Button>
                </View>
            );
        }

        let imageSource = imageError && typeof fallbackSource !== 'function' && fallbackSource ? fallbackSource : (cachedSource ?? source);

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
                        // Forces remount of high resolution images when transitioning from blob URL (uploading) to server URL (uploaded).
                        // Prevents stale Image cache that causes "Attachment not found" errors.
                        // See: https://github.com/Expensify/App/issues/76193
                        key={attachmentID ? `${attachmentID}-${isHighResolution && isUploaded ? 'preview' : 'full'}` : undefined}
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
