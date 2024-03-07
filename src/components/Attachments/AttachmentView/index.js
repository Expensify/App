import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import React, {memo, useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import * as AttachmentsPropTypes from '@components/Attachments/propTypes';
import DistanceEReceipt from '@components/DistanceEReceipt';
import EReceipt from '@components/EReceipt';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CachedPDFPaths from '@libs/actions/CachedPDFPaths';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import compose from '@libs/compose';
import * as TransactionUtils from '@libs/TransactionUtils';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import AttachmentViewImage from './AttachmentViewImage';
import AttachmentViewPdf from './AttachmentViewPdf';
import AttachmentViewVideo from './AttachmentViewVideo';
import {attachmentViewDefaultProps, attachmentViewPropTypes} from './propTypes';

const propTypes = {
    ...attachmentViewPropTypes,
    ...withLocalizePropTypes,

    /** URL to full-sized attachment, SVG function, or numeric static image on native platforms */
    source: AttachmentsPropTypes.attachmentSourcePropType.isRequired,

    /** Flag to show/hide download icon */
    shouldShowDownloadIcon: PropTypes.bool,

    /** Flag to show the loading indicator */
    shouldShowLoadingSpinnerIcon: PropTypes.bool,

    /** Notify parent that the UI should be modified to accommodate keyboard */
    onToggleKeyboard: PropTypes.func,

    /** Extra styles to pass to View wrapper */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Denotes whether it is a workspace avatar or not */
    isWorkspaceAvatar: PropTypes.bool,

    /** Denotes whether it is an icon (ex: SVG) */
    maybeIcon: PropTypes.bool,

    /** The id of the transaction related to the attachment */
    // eslint-disable-next-line react/no-unused-prop-types
    transactionID: PropTypes.string,

    /** The id of the report action related to the attachment */
    reportActionID: PropTypes.string,

    isHovered: PropTypes.bool,

    optionalVideoDuration: PropTypes.number,
};

const defaultProps = {
    ...attachmentViewDefaultProps,
    shouldShowDownloadIcon: false,
    shouldShowLoadingSpinnerIcon: false,
    onToggleKeyboard: () => {},
    containerStyles: [],
    isWorkspaceAvatar: false,
    maybeIcon: false,
    transactionID: '',
    reportActionID: '',
    isHovered: false,
    optionalVideoDuration: 0,
};

function AttachmentView({
    source,
    file,
    isAuthTokenRequired,
    onPress,
    shouldShowLoadingSpinnerIcon,
    shouldShowDownloadIcon,
    containerStyles,
    onToggleKeyboard,
    translate,
    isFocused,
    isUsedInCarousel,
    isUsedInAttachmentModal,
    isWorkspaceAvatar,
    maybeIcon,
    fallbackSource,
    transaction,
    reportActionID,
    isHovered,
    optionalVideoDuration,
}) {
    const {updateCurrentlyPlayingURL} = usePlaybackContext();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [loadComplete, setLoadComplete] = useState(false);
    const isVideo = (typeof source === 'string' && Str.isVideo(source)) || (file && Str.isVideo(file.name));

    useEffect(() => {
        if (!isFocused && !(file && isUsedInAttachmentModal)) {
            return;
        }
        updateCurrentlyPlayingURL(isVideo ? source : null);
    }, [isFocused, isVideo, source, updateCurrentlyPlayingURL, file, isUsedInAttachmentModal]);

    const [imageError, setImageError] = useState(false);

    useNetwork({onReconnect: () => setImageError(false)});

    // Handles case where source is a component (ex: SVG) or a number
    // Number may represent a SVG or an image
    if ((maybeIcon && typeof source === 'number') || _.isFunction(source)) {
        let iconFillColor = '';
        let additionalStyles = [];
        if (isWorkspaceAvatar) {
            const defaultWorkspaceAvatarColor = StyleUtils.getDefaultWorkspaceAvatarColor(file.name);
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

    if (TransactionUtils.hasEReceipt(transaction)) {
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
    if ((_.isString(source) && Str.isPDF(source)) || (file && Str.isPDF(file.name || translate('attachmentView.unknownFilename')))) {
        const encryptedSourceUrl = isAuthTokenRequired ? addEncryptedAuthTokenToURL(source) : source;

        const onPDFLoadComplete = (path) => {
            const id = (transaction && transaction.transactionID) || reportActionID;
            if (path && id) {
                CachedPDFPaths.add(id, path);
            }
            if (!loadComplete) {
                setLoadComplete(true);
            }
        };

        // We need the following View component on android native
        // So that the event will propagate properly and
        // the Password protected preview will be shown for pdf attachement we are about to send.
        return (
            <View style={[styles.flex1, styles.attachmentCarouselContainer]}>
                <AttachmentViewPdf
                    source={source}
                    file={file}
                    isFocused={isFocused}
                    isAuthTokenRequired={isAuthTokenRequired}
                    encryptedSourceUrl={encryptedSourceUrl}
                    onPress={onPress}
                    onToggleKeyboard={onToggleKeyboard}
                    onLoadComplete={onPDFLoadComplete}
                    errorLabelStyles={isUsedInAttachmentModal ? [styles.textLabel, styles.textLarge] : [styles.cursorAuto]}
                    style={isUsedInAttachmentModal ? styles.imageModalPDF : styles.flex1}
                    isUsedInCarousel={isUsedInCarousel}
                />
            </View>
        );
    }

    if (TransactionUtils.isDistanceRequest(transaction)) {
        return <DistanceEReceipt transaction={transaction} />;
    }

    // For this check we use both source and file.name since temporary file source is a blob
    // both PDFs and images will appear as images when pasted into the text field.
    // We also check for numeric source since this is how static images (used for preview) are represented in RN.
    const isImage = typeof source === 'number' || Str.isImage(source);
    if (isImage || (file && Str.isImage(file.name))) {
        return (
            <AttachmentViewImage
                url={imageError ? fallbackSource : source}
                file={file}
                isAuthTokenRequired={isAuthTokenRequired}
                loadComplete={loadComplete}
                isFocused={isFocused}
                isUsedInCarousel={isUsedInCarousel}
                isImage={isImage}
                onPress={onPress}
                onError={() => {
                    setImageError(true);
                }}
            />
        );
    }

    if (isVideo) {
        return (
            <AttachmentViewVideo
                source={source}
                shouldUseSharedVideoElement={isUsedInCarousel}
                isHovered={isHovered}
                videoDuration={optionalVideoDuration}
            />
        );
    }

    return (
        <View style={[styles.defaultAttachmentView, ...containerStyles]}>
            <View style={styles.mr2}>
                <Icon
                    fill={theme.icon}
                    src={Expensicons.Paperclip}
                />
            </View>

            <Text style={[styles.textStrong, styles.flexShrink1, styles.breakAll, styles.flexWrap, styles.mw100]}>{file && file.name}</Text>
            {!shouldShowLoadingSpinnerIcon && shouldShowDownloadIcon && (
                <Tooltip text={translate('common.download')}>
                    <View style={styles.ml2}>
                        <Icon
                            fill={theme.icon}
                            src={Expensicons.Download}
                        />
                    </View>
                </Tooltip>
            )}
            {shouldShowLoadingSpinnerIcon && (
                <View style={styles.ml2}>
                    <Tooltip text={translate('common.downloading')}>
                        <ActivityIndicator
                            size="small"
                            color={theme.textSupporting}
                        />
                    </Tooltip>
                </View>
            )}
        </View>
    );
}

AttachmentView.propTypes = propTypes;
AttachmentView.defaultProps = defaultProps;
AttachmentView.displayName = 'AttachmentView';

export default compose(
    memo,
    withLocalize,
    withOnyx({
        transaction: {
            key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        },
    }),
)(AttachmentView);
