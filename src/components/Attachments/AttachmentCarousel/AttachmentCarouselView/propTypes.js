import PropTypes from 'prop-types';
import * as AttachmentsPropTypes from '../../propTypes';

const propTypes = {
    /**
     * The initial page of the carousel
     */
    initialPage: PropTypes.number.isRequired,

    /**
     * The attachments of the carousel
     */
    attachments: AttachmentsPropTypes.attachmentsPropType.isRequired,

    /**
     * The initial active ource of the carousel
     */
    initialActiveSource: PropTypes.string,

    /**
     * The container dimensions
     */
    containerDimensions: PropTypes.shape({
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
    }).isRequired,
};

export default propTypes;
