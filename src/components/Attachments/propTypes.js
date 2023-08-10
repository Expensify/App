import PropTypes from 'prop-types';

const attachmentSourcePropType = PropTypes.oneOfType([PropTypes.string, PropTypes.func]);
const attachmentFilePropType = PropTypes.shape({
    name: PropTypes.string,
});

const attachmentPropType = PropTypes.shape({
    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    /** URL to full-sized attachment or SVG function */
    source: attachmentSourcePropType.isRequired,

    /** File object maybe be instance of File or Object */
    file: attachmentFilePropType,
});

const attachmentsPropType = PropTypes.arrayOf(attachmentPropType);

export {attachmentSourcePropType, attachmentFilePropType, attachmentPropType, attachmentsPropType};
