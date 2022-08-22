import React, {memo} from 'react';
import {View, ActivityIndicator} from 'react-native';
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

const propTypes = {
    /** URL to full-sized attachment */
    sourceURL: PropTypes.string.isRequired,

    /** File object maybe be instance of File or Object */
    file: PropTypes.shape({
        name: PropTypes.string,
    }),

    /** Flag to show/hide download icon */
    shouldShowDownloadIcon: PropTypes.bool,

    /** Flag to show the loading indicator */
    shouldShowLoadingSpinnerIcon: PropTypes.bool,

    /** Notify parent that the UI should be modified to accommodate keyboard */
    onToggleKeyboard: PropTypes.func,

    ...withLocalizePropTypes,
};

const defaultProps = {
    file: {
        name: '',
    },
    shouldShowDownloadIcon: false,
    shouldShowLoadingSpinnerIcon: false,
    onToggleKeyboard: () => {},
};

const AttachmentView = (props) => {
    // Check both sourceURL and file.name since PDFs dragged into the the text field
    // will appear with a sourceURL that is a blob
    if (Str.isPDF(props.sourceURL)
        || (props.file && Str.isPDF(props.file.name || props.translate('attachmentView.unknownFilename')))) {
        return (
            <PDFView
                sourceURL={props.sourceURL}
                style={styles.imageModalPDF}
                onToggleKeyboard={props.onToggleKeyboard}
            />
        );
    }

    // For this check we use both sourceURL and file.name since temporary file sourceURL is a blob
    // both PDFs and images will appear as images when pasted into the the text field
    if (Str.isImage(props.sourceURL) || (props.file && Str.isImage(props.file.name))) {
        return (
            <ImageView url={props.sourceURL} />
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
