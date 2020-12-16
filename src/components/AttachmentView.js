import React from 'react';
import {View, Image, Text} from 'react-native';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import styles from '../styles/styles';
import PDFView from './PDFView';
import ImageView from './ImageView';
import iconFile from '../../assets/images/icon-file.png';

const propTypes = {
    // URL to full-sized attachment
    sourceURL: PropTypes.string.isRequired,

    // Height of image
    height: PropTypes.number,

    // Width of image
    width: PropTypes.number,

    file: PropTypes.shape({
        name: PropTypes.string,
    }),

    // Callback to fire once image has been measured
    onImagePrefetched: PropTypes.func.isRequired,
};

const defaultProps = {
    height: 200,
    width: 200,
    file: {
        name: 'Unknown Filename',
    },
};

const AttachmentView = (props) => {
    // Check both sourceURL and file.name since PDFs dragged into the the text field
    // will appear with a sourceURL that is a blob
    if (Str.isPDF(props.sourceURL) || (props.file && Str.isPDF(props.file.name))) {
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
            <ImageView
                width={props.width}
                height={props.height}
                url={props.sourceURL}
                onMeasure={props.onImagePrefetched}
            />
        );
    }

    return (
        <View
            style={styles.defaultAttachmentView}
        >
            <Image
                source={iconFile}
                style={styles.defaultAttachmentViewIcon}
            />
            <Text style={styles.textStrong}>{props.file && props.file.name}</Text>
        </View>
    );
};

AttachmentView.propTypes = propTypes;
AttachmentView.defaultProps = defaultProps;
AttachmentView.displayName = 'AttachmentView';

export default AttachmentView;
