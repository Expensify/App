import React from 'react';
import ImageModalBase from './ImageModalBase';
import propTypes from './imageModalPropTypes';

const defaultProps = {
    sourceURL: null,
};

const ImageModal = props => (
    <ImageModalBase
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        pinToEdges
    >
        {props.children}
    </ImageModalBase>
);

ImageModal.propTypes = propTypes;
ImageModal.displayName = 'ImageModal';
ImageModal.defaultProps = defaultProps;

export default ImageModal;
