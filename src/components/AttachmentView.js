import React, {memo} from 'react';
import {View, ActivityIndicator} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import styles from '../styles/styles';
import PDFView from './PDFView';
import ImageView from './ImageView';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import Text from './Text';
import Tooltip from './Tooltip';
import themeColors from '../styles/themes/default';
import variables from '../styles/variables';
import addEncryptedAuthTokenToURL from '../libs/addEncryptedAuthTokenToURL';

const propTypes = {
    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    /** URL to full-sized attachment or SVG function */
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,

    /** File object maybe be instance of File or Object */
    file: PropTypes.shape({
        name: PropTypes.string,
    }),

    /** Flag to show/hide download icon */
    shouldShowDownloadIcon: PropTypes.bool,

    /** Flag to show the loading indicator */
    shouldShowLoadingSpinnerIcon: PropTypes.bool,

    /** Function for handle on press */
    onPress: PropTypes.func,

    /** Notify parent that the UI should be modified to accommodate keyboard */
    onToggleKeyboard: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isAuthTokenRequired: false,
    file: {
        name: '',
    },
    shouldShowDownloadIcon: false,
    shouldShowLoadingSpinnerIcon: false,
    onPress: () => {},
    onToggleKeyboard: () => {},
};

const AttachmentView = (props) => {
    // Handles case where source is a component (ex: SVG)
    if (_.isFunction(props.source)) {
        return (
            <Icon src={props.source} height={variables.defaultAvatarPreviewSize} width={variables.defaultAvatarPreviewSize} />
        );
    }

    // Check both source and file.name since PDFs dragged into the the text field
    // will appear with a source that is a blob
    if (Str.isPDF(props.source)
        || (props.file && Str.isPDF(props.file.name || props.translate('attachmentView.unknownFilename')))) {
        const sourceURL = props.isAuthTokenRequired
            ? addEncryptedAuthTokenToURL(props.source)
            : props.source;
        return (
            <PDFView
                onPress={props.onPress}
                sourceURL={sourceURL}
                style={styles.imageModalPDF}
                onToggleKeyboard={props.onToggleKeyboard}
            />
        );
    }

    // For this check we use both source and file.name since temporary file source is a blob
    // both PDFs and images will appear as images when pasted into the the text field
    if (Str.isImage(props.source) || (props.file && Str.isImage(props.file.name))) {
        return (
            <ImageView url={props.source} isAuthTokenRequired={props.isAuthTokenRequired} />
        );
    }

    return (
        <View
            style={styles.defaultAttachmentView}
        >
            <View style={styles.mr2}>
                <Icon src={Expensicons.Paperclip} />
            </View>

            <Text style={[styles.textStrong, styles.flexShrink1, styles.breakAll, styles.flexWrap, styles.mw100]}>{props.file && props.file.name}</Text>
            {!props.shouldShowLoadingSpinnerIcon && props.shouldShowDownloadIcon && (
                <View style={styles.ml2}>
                    <Tooltip text={props.translate('common.download')}>
                        <Icon src={Expensicons.Download} />
                    </Tooltip>
                </View>
            )}
            {props.shouldShowLoadingSpinnerIcon && (
                <View style={styles.ml2}>
                    <Tooltip text={props.translate('common.downloading')}>
                        <ActivityIndicator
                            size="small"
                            color={themeColors.textSupporting}
                        />
                    </Tooltip>
                </View>
            )}
        </View>
    );
};

AttachmentView.propTypes = propTypes;
AttachmentView.defaultProps = defaultProps;
AttachmentView.displayName = 'AttachmentView';

export default compose(
    memo,
    withLocalize,
)(AttachmentView);
