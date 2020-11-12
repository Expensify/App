import React from 'react';
import PropTypes from 'prop-types';
import Str from 'js-libs/lib/str';
import styles from '../styles/StyleSheet';
import PDFView from './PDFView';
import ImageView from './ImageView';

const propTypes = {
    // URL to full-sized attachment
    sourceURL: PropTypes.string.isRequired,

    // Height of image
    imageHeight: PropTypes.number,

    // Width of image
    imageWidth: PropTypes.number,
};

const defaultProps = {
    imageHeight: 200,
    imageWidth: 200,
};

const AttachmentView = props => (
    <>
        {(Str.isPDF(props.sourceURL)) ? (
            <PDFView
                sourceURL={props.sourceURL}
                style={styles.imageModalPDF}
            />
        ) : (
            <ImageView
                imageWidth={props.imageWidth}
                imageHeight={props.imageHeight}
                sourceURL={props.sourceURL}
            />
        )}
    </>
);

AttachmentView.propTypes = propTypes;
AttachmentView.defaultProps = defaultProps;
AttachmentView.displayName = 'AttachmentView';

export default AttachmentView;
