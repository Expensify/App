import {Str} from 'expensify-common';
import React, {memo, useContext, useEffect, useState} from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AttachmentCarouselPagerContext from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import type {Attachment, AttachmentSource} from '@components/Attachments/types';
import DistanceEReceipt from '@components/DistanceEReceipt';
import EReceipt from '@components/EReceipt';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ScrollView from '@components/ScrollView';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CachedPDFPaths from '@libs/actions/CachedPDFPaths';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import type {ColorValue} from '@styles/utils/types';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import AttachmentViewImage from './AttachmentViewImage';
import AttachmentViewPdf from './AttachmentViewPdf';
import AttachmentViewVideo from './AttachmentViewVideo';
import DefaultAttachmentView from './DefaultAttachmentView';
import HighResolutionInfo from './HighResolutionInfo';

type AttachmentViewOnyxProps = {
    transaction: OnyxEntry<Transaction>;
};

type AttachmentViewProps = AttachmentViewOnyxProps &
    Attachment & {
        /** Whether this view is the active screen  */
        isFocused?: boolean;

        /** Function for handle on press */
        onPress?: (e?: GestureResponderEvent | KeyboardEvent) => void;

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
    };

function AttachmentView({
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
    transaction,
    reportActionID,
    isHovered,
    duration,
    isUsedAsChatAttachment,
    isUploaded = true,
}: AttachmentViewProps) {
    const {translate} = useLocalize();
    const {updateCurrentlyPlayingURL} = usePlaybackContext();
    const attachmentCarouselPagerContext = useContext(AttachmentCarouselPagerContext);
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [loadComplete, setLoadComplete] = useState(false);
    const [isHighResolution, setIsHighResolution] = useState<boolean>(false);
    const [hasPDFFailedToLoad, setHasPDFFailedToLoad] = useState(false);
    const isVideo = (typeof source === 'string' && Str.isVideo(source)) || (file?.name && Str.isVideo(file.name));
    const isUsedInCarousel = !!attachmentCarouselPagerContext?.pagerRef;

    useEffect(() => {
        if (!isFocused && !(file && isUsedInAttachmentModal)) {
            return;
        }
        updateCurrentlyPlayingURL(isVideo && typeof source === 'string' ? source : null);
    }, [file, isFocused, isUsedInAttachmentModal, isVideo, source, updateCurrentlyPlayingURL]);

    const [imageError, setImageError] = useState(false);

    useNetwork({onReconnect: () => setImageError(false)});

    useEffect(() => {
        FileUtils.getFileResolution(file).then((resolution) => {
            setIsHighResolution(FileUtils.isHighResolutionImage(resolution));
        });
    }, [file]);

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
            />
        );
    }

    if (transaction && !TransactionUtils.hasReceiptSource(transaction) && TransactionUtils.hasEReceipt(transaction)) {
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
    if (!hasPDFFailedToLoad && (isSourcePDF || isFilePDF)) {
        const encryptedSourceUrl = isAuthTokenRequired ? addEncryptedAuthTokenToURL(source as string) : (source as string);

        const onPDFLoadComplete = (path: string) => {
            const id = (transaction && transaction.transactionID) ?? reportActionID;
            if (path && id) {
                CachedPDFPaths.add(id, path);
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
        // the Password protected preview will be shown for pdf attachement we are about to send.
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

    if (TransactionUtils.isDistanceRequest(transaction) && transaction) {
        return <DistanceEReceipt transaction={transaction} />;
    }

    // For this check we use both source and file.name since temporary file source is a blob
    // both PDFs and images will appear as images when pasted into the text field.
    // We also check for numeric source since this is how static images (used for preview) are represented in RN.
    const isSourceImage = typeof source === 'number' || (typeof source === 'string' && Str.isImage(source));
    const isFileNameImage = file?.name && Str.isImage(file.name);
    const isFileImage = isSourceImage || isFileNameImage;

    if (isFileImage) {
        if (imageError && (typeof fallbackSource === 'number' || typeof fallbackSource === 'function')) {
            return (
                <Icon
                    src={fallbackSource}
                    height={variables.defaultAvatarPreviewSize}
                    width={variables.defaultAvatarPreviewSize}
                    additionalStyles={[styles.alignItemsCenter, styles.justifyContentCenter, styles.flex1]}
                    fill={theme.border}
                />
            );
        }
        let imageSource = imageError && fallbackSource ? (fallbackSource as string) : (source as string);

        if (isHighResolution) {
            if (!isUploaded) {
                return (
                    <>
                        <View style={styles.imageModalImageCenterContainer}>
                            <DefaultAttachmentView
                                icon={Expensicons.Gallery}
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
            imageSource = previewSource?.toString() ?? imageSource;
        }

        return (
            <>
                <View style={styles.imageModalImageCenterContainer}>
                    <AttachmentViewImage
                        url={imageSource}
                        file={file}
                        isAuthTokenRequired={isAuthTokenRequired}
                        loadComplete={loadComplete}
                        isImage={isFileImage}
                        onPress={onPress}
                        onError={() => {
                            setImageError(true);
                        }}
                    />
                </View>
                {isHighResolution && <HighResolutionInfo isUploaded={isUploaded} />}
            </>
        );
    }

    if ((isVideo ?? (file?.name && Str.isVideo(file.name))) && typeof source === 'string') {
        return (
            <AttachmentViewVideo
                source={source}
                shouldUseSharedVideoElement={isUsedInCarousel}
                isHovered={isHovered}
                duration={duration}
            />
        );
    }

    return (
        <DefaultAttachmentView
            fileName={file?.name}
            shouldShowDownloadIcon={shouldShowDownloadIcon}
            shouldShowLoadingSpinnerIcon={shouldShowLoadingSpinnerIcon}
            containerStyles={containerStyles}
        />
    );
}

AttachmentView.displayName = 'AttachmentView';

export default memo(
    withOnyx<AttachmentViewProps, AttachmentViewOnyxProps>({
        transaction: {
            key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        },
    })(AttachmentView),
);

export type {AttachmentViewProps};
