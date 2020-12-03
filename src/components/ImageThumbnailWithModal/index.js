import React from 'react';
import PropTypes from 'prop-types';
import BaseImageModal from '../BaseImageModal';

const propTypes = {
    // URL to image preview
    previewSourceURL: PropTypes.string.isRequired,

    // URL to full-sized image
    sourceURL: PropTypes.string.isRequired,

    // Do the url passed require authToken?
    isAuthTokenRequired: PropTypes.bool.isRequired,
};

const ImageThumbnailWithModal = props => (
    <BaseImageModal
        previewSourceURL={props.previewSourceURL}
        sourceURL={props.sourceURL}
        modalTitle="Attachment"
        isAuthTokenRequired={isAuthTokenRequired}
    />
);

ImageThumbnailWithModal.propTypes = propTypes;
ImageThumbnailWithModal.displayName = 'ImageThumbnailWithModal';

export default ImageThumbnailWithModal;
