import PropTypes from 'prop-types';

const attachmentsPropType = PropTypes.arrayOf(
    PropTypes.shape({
        // eslint-disable-next-line react/forbid-prop-types
        file: PropTypes.object.isRequired,
        isAuthTokenRequired: PropTypes.bool.isRequired,
        source: PropTypes.string.isRequired,
    }),
);

const propTypes = {
    /**
     * The initial page of the carousel
     */
    initialPage: PropTypes.number.isRequired,

    /**
     * The attachments of the carousel
     */
    attachments: attachmentsPropType.isRequired,

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

export {propTypes, attachmentsPropType};
