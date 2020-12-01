import React from 'react';
import PropTypes from 'prop-types';
import ImageModalBase from './ImageModalBase';

const propTypes = {
    // Title of Modal
    title: PropTypes.string.isRequired,

    sourceURL: PropTypes.string.sourceURL,
};

const defaultProps = {
    sourceURL: null,
};

const ImageModal = props => (
    <ImageModalBase
        {...props}
    >
        {props.children}
    </ImageModalBase>
);

ImageModal.propTypes = propTypes;
ImageModal.defaultProps = defaultProps;
ImageModal.displayName = 'ImageModal';

export default ImageModal;
