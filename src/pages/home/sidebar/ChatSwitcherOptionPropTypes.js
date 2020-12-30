import PropTypes from 'prop-types';

export default PropTypes.shape({
    // The full name of the user if available, otherwise the login (email/phone number) of the user
    text: PropTypes.string.isRequired,

    // The login of the user, or the name of the chat room
    alternateText: PropTypes.string.isRequired,

    // Avatar URLS of the participants in the group chat
    icons: PropTypes.arrayOf(String),

    // The type of option we have e.g. user or report
    type: PropTypes.string,

    // Array of the login of all users in a chat
    participants: PropTypes.arrayOf(String),

    // The option key provided to FlatList keyExtractor
    keyForList: PropTypes.string,
});
