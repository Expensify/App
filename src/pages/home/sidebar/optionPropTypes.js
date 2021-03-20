import PropTypes from 'prop-types';

const participantPropTypes = PropTypes.shape({
    // Primary login of participant
    login: PropTypes.string,

    // Display Name of participant
    displayName: PropTypes.string,

    // Avatar url of participant
    avatar: PropTypes.string,
});

const optionPropTypes = PropTypes.shape({
    // The full name of the user if available, otherwise the login (email/phone number) of the user
    text: PropTypes.string.isRequired,

    // Subtitle to show under report displayName, mostly lastMessageText of the report
    alternateText: PropTypes.string.isRequired,

    // List of participants of the report
    participantsList: PropTypes.arrayOf(participantPropTypes).isRequired,

    // The array URLs of the person's avatar
    icon: PropTypes.arrayOf(PropTypes.string),

    // The type of option we have e.g. user or report
    type: PropTypes.string,

    // The option key provided to FlatList keyExtractor
    keyForList: PropTypes.string,

    // Text to show for tooltip
    tooltipText: PropTypes.string,
});

export {
    participantPropTypes,
    optionPropTypes,
};
