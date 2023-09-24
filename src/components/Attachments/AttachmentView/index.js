import React, {memo, useState} from 'react';
import {View, ActivityIndicator} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import styles from '../../../styles/styles';
import Icon from '../../Icon';
import * as Expensicons from '../../Icon/Expensicons';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import compose from '../../../libs/compose';
import Text from '../../Text';
import Tooltip from '../../Tooltip';
import themeColors from '../../../styles/themes/default';
import variables from '../../../styles/variables';
import AttachmentViewImage from './AttachmentViewImage';
import AttachmentViewPdf from './AttachmentViewPdf';
import addEncryptedAuthTokenToURL from '../../../libs/addEncryptedAuthTokenToURL';
import * as StyleUtils from '../../../styles/StyleUtils';
import {attachmentViewPropTypes, attachmentViewDefaultProps} from './propTypes';

const propTypes = {
    ...attachmentViewPropTypes,
    ...withLocalizePropTypes,

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
};

const defaultProps = {
    ...attachmentViewDefaultProps,
    shouldShowDownloadIcon: false,
    shouldShowLoadingSpinnerIcon: false,
    onToggleKeyboard: () => {},
    containerStyles: [],
    isWorkspaceAvatar: false,
};

function AttachmentView({
    source,
    file,
    isAuthTokenRequired,
    isUsedInCarousel,
    onPress,
    shouldShowLoadingSpinnerIcon,
    shouldShowDownloadIcon,
    containerStyles,
    onScaleChanged,
    onToggleKeyboard,
    translate,
    isFocused,
    isWorkspaceAvatar,
}) {
    const [loadComplete, setLoadComplete] = useState(false);

    // Handles case where source is a component (ex: SVG)
    if (_.isFunction(source)) {
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

    // Check both source and file.name since PDFs dragged into the the text field
    // will appear with a source that is a blob
    if (Str.isPDF(source) || (file && Str.isPDF(file.name || translate('attachmentView.unknownFilename')))) {
        const encryptedSourceUrl = isAuthTokenRequired ? addEncryptedAuthTokenToURL(source) : source;

        return (
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
            />
        );
    }

    // For this check we use both source and file.name since temporary file source is a blob
    // both PDFs and images will appear as images when pasted into the the text field
    const isImage = Str.isImage(source);
    if (isImage || (file && Str.isImage(file.name))) {
        return (
            <AttachmentViewImage
                source={source}
                file={file}
                isAuthTokenRequired={isAuthTokenRequired}
                isUsedInCarousel={isUsedInCarousel}
                loadComplete={loadComplete}
                isFocused={isFocused}
                isImage={isImage}
                onPress={onPress}
                onScaleChanged={onScaleChanged}
            />
        );
    }

    return (
        <View style={[styles.defaultAttachmentView, ...containerStyles]}>
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
                            color={themeColors.textSupporting}
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

export default compose(memo, withLocalize)(AttachmentView);
