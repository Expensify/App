import React from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import RenderHTML from '../RenderHTML';
import Image from '../Image';

const propTypes = {
    /** thumbnail URI for the image */
    thumbnail: PropTypes.string,

    /** URI for the image */
    image: PropTypes.string.isRequired,

    /** whether or not to enable the image preview modal */
    enablePreviewModal: PropTypes.bool,
};

const defaultProps = {
    thumbnail: null,
    enablePreviewModal: false,
};

function ReportActionItemImage({thumbnail, image, enablePreviewModal}) {
    if (thumbnail) {
        return (
            <RenderHTML
                html={`
                    <img
                        src="${thumbnail}"
                        data-expensify-source="${image}"
                        data-expensify-fit-container="true"
                        data-expensify-preview-modal-disabled="${!enablePreviewModal}"
                    />
            `}
            />
        );
    }

    return (
        <Image
            source={{uri: image}}
            style={[styles.w100, styles.h100]}
        />
    );
}

ReportActionItemImage.propTypes = propTypes;
ReportActionItemImage.defaultProps = defaultProps;
ReportActionItemImage.displayName = 'ReportActionItemImage';

export default ReportActionItemImage;
