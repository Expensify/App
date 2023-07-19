import PropTypes from 'prop-types';

const attachmentPropType = PropTypes.shape({
    /** Whether source url requires authentication */
    isAuthTokenRequired: PropTypes.bool,

    /** URL to full-sized attachment or SVG function */
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,

    /** File object maybe be instance of File or Object */
    file: PropTypes.shape({
        name: PropTypes.string,
    }),
});

const attachmentsPropType = PropTypes.arrayOf(attachmentPropType);

export {attachmentPropType, attachmentsPropType};
