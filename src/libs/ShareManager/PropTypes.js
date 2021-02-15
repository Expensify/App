import PropTypes from 'prop-types';

/**
 * SharedItem PropTypes.
 */
export default {
    // Shared item object
    sharedItem: PropTypes.shape({
        // Shared item type (one of the `ShareType.*`)
        type: PropTypes.string.isRequired,

        // Shared item data. Differs depending on type
        data: PropTypes.oneOfType([
            // Text or HTML for `ShareType.TEXT`
            PropTypes.string,

            // File data structure for `ShareType.FILE`
            PropTypes.shape({
                // File name
                name: PropTypes.string.isRequired,

                // File MIME type
                type: PropTypes.string.isRequired,

                // File URI
                uri: PropTypes.string.isRequired,
            }),
        ]).isRequired,
    }),
};
