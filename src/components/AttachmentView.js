import React, {memo} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import styles from '../styles/styles';
import PDFView from './PDFView';
import ImageView from './ImageView';
import Icon from './Icon';
import {Paperclip, Download} from './Icon/Expensicons';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import Text from './Text';
import Tooltip from './Tooltip';

const propTypes = {
    /** URL to full-sized attachment */
    sourceURL: PropTypes.string.isRequired,

    /** File object maybe be instance of File or Object */
    file: PropTypes.shape({
        name: PropTypes.string,
    }),

    /** Flag to show/hide download icon */
    shouldShowDownloadIcon: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    file: {
        name: '',
    },
    shouldShowDownloadIcon: false,
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

    const splitFileNameAndExtension = (name) => {
        if (!name) {
            return '';
        }
        const splitNames = name.split('.');
        const extension = `.${splitNames.pop()}`;
        const baseName = splitNames.join('.');
        return {extension, baseName};
    };

    const renderFileName = () => {
        const fileName = lodashGet(props, 'file.name', '');
        const {baseName, extension} = splitFileNameAndExtension(fileName);
        return (
            <View style={[styles.flexRow, styles.flex1]}>
                <View style={[styles.flexShrink1]}>
                    <Text style={[styles.textStrong]} numberOfLines={1}>{baseName}</Text>
                </View>
                <View style={[styles.flexShrink0]}>
                    <Text style={[styles.textStrong]}>{extension}</Text>
                </View>
            </View>
        );
    };

    return (
        <View
            style={styles.defaultAttachmentView}
        >
            <View style={styles.mr2}>
                <Icon src={Paperclip} />
            </View>
            {renderFileName()}
            {props.shouldShowDownloadIcon && (
                <View style={styles.ml2}>
                    <Tooltip text={props.translate('common.download')}>
                        <Icon src={Download} />
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
