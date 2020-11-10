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

    // Any additional styles to apply to the image thumbnail
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.any,
};

const defaultProps = {
    style: {}
};

const ImageThumbnailWithModal = props => (
    <BaseImageModal
        pinToEdges
        previewSourceURL={props.previewSourceURL}
        sourceURL={props.sourceURL}
        style={props.style}
    />
);

ImageThumbnailWithModal.propTypes = propTypes;
ImageThumbnailWithModal.defaultProps = defaultProps;
ImageThumbnailWithModal.displayName = 'ImageThumbnailWithModal';

export default ImageThumbnailWithModal;
