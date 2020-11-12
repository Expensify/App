import React from 'react';
import PropTypes from 'prop-types';
import BaseImageModal from '../BaseImageModal';

/**
 * Image modal component that is triggered when pressing on an image
 * On native, we indicate that the modal is fullscreen with props to BaseImageModal
 */

const propTypes = {
    // URL to image preview
    previewSourceURL: PropTypes.string.isRequired,

    // URL to full-sized image
    sourceURL: PropTypes.string.isRequired,
};

const defaultProps = {
    style: {}
};

const ImageThumbnailWithModal = props => (
    <BaseImageModal
        pinToEdges={false}
        previewSourceURL={props.previewSourceURL}
        sourceURL={props.sourceURL}
    />
);

ImageThumbnailWithModal.propTypes = propTypes;
ImageThumbnailWithModal.defaultProps = defaultProps;
ImageThumbnailWithModal.displayName = 'ImageThumbnailWithModal';

export default ImageThumbnailWithModal;
