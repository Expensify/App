import React from 'react';
import PropTypes from 'prop-types';
import BaseImageModal from '../BaseImageModal';

const propTypes = {
    // URL to image preview
    previewSourceURL: PropTypes.string.isRequired,

    // URL to full-sized image
    sourceURL: PropTypes.string.isRequired,
};

const ImageThumbnailWithModal = props => (
    <BaseImageModal
        previewSourceURL={props.previewSourceURL}
        sourceURL={props.sourceURL}
    />
);

ImageThumbnailWithModal.propTypes = propTypes;
ImageThumbnailWithModal.displayName = 'ImageThumbnailWithModal';

export default ImageThumbnailWithModal;
