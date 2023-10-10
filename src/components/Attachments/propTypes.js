import PropTypes from 'prop-types';

const attachmentSourcePropType = PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.number]);
const attachmentFilePropType = PropTypes.shape({
    name: PropTypes.string,
});

const attachmentPropType = PropTypes.shape({
    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    /** URL to full-sized attachment, SVG function, or numeric static image on native platforms */
    source: attachmentSourcePropType.isRequired,

    /** File object can be an instance of File or Object */
    file: attachmentFilePropType,
});

const attachmentsPropType = PropTypes.arrayOf(attachmentPropType);

export {attachmentSourcePropType, attachmentFilePropType, attachmentPropType, attachmentsPropType};
