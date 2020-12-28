import PropTypes from 'prop-types';

export default PropTypes.shape({
    // The full name of the user if available, otherwise the login (email/phone number) of the user
    text: PropTypes.string.isRequired,

    // The login of the user, or the name of the chat room
    alternateText: PropTypes.string.isRequired,

    // The URL of the person's avatar
    icon: PropTypes.string,

    // URLS OF ONE OR TWO PARTICIPANTS' AVATAR FOR GROUP CHAT
    groupIcons: PropTypes.arrayOf(String),

    // The type of option we have e.g. user or report
    type: PropTypes.string,

    // ARRAY OF THE LOGIN OF ALL USERS IN A CHAT
    participants: PropTypes.arrayOf(String),

    // The option key provided to FlatList keyExtractor
    keyForList: PropTypes.string,
});
