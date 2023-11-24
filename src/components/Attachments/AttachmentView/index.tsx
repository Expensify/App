import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import React, {memo, useState} from 'react';
import {ActivityIndicator, ImageSourcePropType, ScrollView, StyleProp, View, ViewStyle} from 'react-native';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import DistanceEReceipt from '@components/DistanceEReceipt';
import EReceipt from '@components/EReceipt';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import compose from '@libs/compose';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import cursor from '@styles/utilities/cursor';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import {Transaction} from '@src/types/onyx';
import AttachmentViewImage from './AttachmentViewImage';
import AttachmentViewPdf from './AttachmentViewPdf';
import AttachmentProps from './types';

type AttachmentViewOnyxProps = {
    /** The transaction currently being looked at */
    transaction: OnyxEntry<Transaction>;
};

type AttachmentViewProps = {
    /** Flag to show/hide download icon */
    shouldShowDownloadIcon?: boolean;

    /** Flag to show the loading indicator */
    shouldShowLoadingSpinnerIcon?: boolean;

    /** Notify parent that the UI should be modified to accommodate keyboard */
    onToggleKeyboard?: () => void;

    /** Extra styles to pass to View wrapper */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles?: StyleProp<ViewStyle>;

    /** Denotes whether it is a workspace avatar or not */
    isWorkspaceAvatar?: boolean;

    /** The id of the transaction related to the attachment */
    // eslint-disable-next-line react/no-unused-prop-types
    transactionID?: string;

    fallbackSource?: string | ImageSourcePropType;
} & AttachmentProps &
    AttachmentViewOnyxProps;

function AttachmentView({
    source,
    file = {name: ''} as File,
    isAuthTokenRequired = false,
    isUsedInCarousel,
    onPress,
    shouldShowLoadingSpinnerIcon = false,
    shouldShowDownloadIcon = false,
    containerStyles,
    onScaleChanged = () => {},
    onToggleKeyboard = () => {},
    isFocused = false,
    isWorkspaceAvatar = false,
    fallbackSource,
    transaction,
    isUsedInAttachmentModal = false,
}: AttachmentViewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [loadComplete, setLoadComplete] = useState(false);
    const [imageError, setImageError] = useState(false);
    const {translate} = useLocalize();

    useNetwork({onReconnect: () => setImageError(false)});

    // Handles case where source is a component (ex: SVG)
    if (typeof source === 'function') {
        let iconFillColor = '';
        let additionalStyles: StyleProp<ViewStyle> = [];
        if (isWorkspaceAvatar) {
            const defaultWorkspaceAvatarColor = StyleUtils.getDefaultWorkspaceAvatarColor(file.name);
            iconFillColor = defaultWorkspaceAvatarColor.fill ?? '';
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
                    <EReceipt transactionID={transaction?.transactionID ?? ''} />
                </ScrollView>
            </View>
        );
    }

    // Check both source and file.name since PDFs dragged into the text field
    // will appear with a source that is a blob
    if ((typeof source === 'string' && Str.isPDF(source)) || (file && Str.isPDF(file.name || translate('attachmentView.unknownFilename')))) {
        const encryptedSourceUrl = isAuthTokenRequired ? addEncryptedAuthTokenToURL(source) : source;

        // We need the following View component on android native
        // So that the event will propagate properly and
        // the Password protected preview will be shown for pdf attachement we are about to send.
        return (
            <View style={[styles.flex1, styles.attachmentCarouselContainer]}>
                <AttachmentViewPdf
                    source={source}
                    file={file}
                    isAuthTokenRequired={isAuthTokenRequired}
                    encryptedSourceUrl={encryptedSourceUrl}
                    isUsedInCarousel={isUsedInCarousel}
                    isFocused={isFocused}
                    onPress={onPress}
                    onScaleChanged={onScaleChanged}
                    onToggleKeyboard={onToggleKeyboard}
                    onLoadComplete={() => !loadComplete && setLoadComplete(true)}
                    errorLabelStyles={isUsedInAttachmentModal ? [styles.textLabel, styles.textLarge] : [cursor.cursorAuto]}
                    style={isUsedInAttachmentModal ? styles.imageModalPDF : styles.flex1}
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
                source={imageError ? fallbackSource : source}
                file={file}
                isAuthTokenRequired={isAuthTokenRequired}
                isUsedInCarousel={isUsedInCarousel}
                loadComplete={loadComplete}
                isFocused={isFocused}
                isImage={isImage}
                onPress={onPress}
                onScaleChanged={onScaleChanged}
                onError={() => {
                    setImageError(true);
                }}
            />
        );
    }

    return (
        <View style={[styles.defaultAttachmentView, containerStyles]}>
            <View style={styles.mr2}>
                <Icon src={Expensicons.Paperclip} />
            </View>

            <Text style={[styles.textStrong, styles.flexShrink1, styles.breakAll, styles.flexWrap, styles.mw100]}>{file && file.name}</Text>
            {!shouldShowLoadingSpinnerIcon && shouldShowDownloadIcon && (
                <Tooltip text={translate('common.download')}>
                    <View style={styles.ml2}>
                        <Icon src={Expensicons.Download} />
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

AttachmentView.displayName = 'AttachmentView';

export default compose(
    memo,
    withOnyx<AttachmentViewProps, AttachmentViewOnyxProps>({
        transaction: {
            key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        },
    }),
)(AttachmentView);
