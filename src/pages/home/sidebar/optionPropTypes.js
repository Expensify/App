import PropTypes from 'prop-types';

export default PropTypes.shape({
    // The full name of the user if available, otherwise the login (email/phone number) of the user
    text: PropTypes.string.isRequired,

    // Subtitle to show under report displayName, mostly lastMessageText of the report
    alternateText: PropTypes.string.isRequired,

    // list of particiapants of the report
    participantsList: PropTypes.arrayOf(
        PropTypes.shape({
            // primary login of participant
            login: PropTypes.string,

            // display Name of participant
            displayName: PropTypes.string,

            // avatar url of participant
            avatar: PropTypes.string,
        }),
    ).isRequired,

    // The array URLs of the person's avatar
    icon: PropTypes.arrayOf(PropTypes.string),

    // The type of option we have e.g. user or report
    type: PropTypes.string,

    // The option key provided to FlatList keyExtractor
    keyForList: PropTypes.string,
});
