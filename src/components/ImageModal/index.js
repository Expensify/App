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
    >
        {props.children}
    </ImageModalBase>
);

ImageModal.propTypes = propTypes;
ImageModal.defaultProps = defaultProps;
ImageModal.displayName = 'ImageModal';

export default ImageModal;
