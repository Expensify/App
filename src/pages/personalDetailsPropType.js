import PropTypes from 'prop-types';

export default PropTypes.shape({
    // First name of the current user from their personal details
    firstName: PropTypes.string,

    // Last name of the current user from their personal details
    lastName: PropTypes.string,

    // Display name of the current user from their personal details
    displayName: PropTypes.string,

    // Avatar URL of the current user from their personal details
    avatar: PropTypes.string,

    // Flag to set when Avatar uploading
    avatarUploading: PropTypes.bool,

    // login of the current user from their personal details
    login: PropTypes.string,

    // pronouns of the current user from their personal details
    pronouns: PropTypes.string,

    // local currency for the user
    localCurrencyCode: PropTypes.string,

    // timezone of the current user from their personal details
    timezone: PropTypes.shape({
        // Value of selected timezone
        selected: PropTypes.string,

        // Whether timezone is automatically set
        automatic: PropTypes.bool,
    }),
});
