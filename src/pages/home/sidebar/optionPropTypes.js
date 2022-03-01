import PropTypes from 'prop-types';

const participantPropTypes = PropTypes.shape({
    // Primary login of participant
    login: PropTypes.string,

    // Display Name of participant
    displayName: PropTypes.string,

    // Avatar url of participant
    avatar: PropTypes.string,

    /** First Name of the participant */
    firstName: PropTypes.string,
});

const optionPropTypes = PropTypes.shape({
    // The full name of the user if available, otherwise the login (email/phone number) of the user
    text: PropTypes.string.isRequired,

    // Subtitle to show under report displayName, mostly lastMessageText of the report
    alternateText: PropTypes.string,

    // List of participants of the report
    participantsList: PropTypes.arrayOf(participantPropTypes),

    // The array URLs or icons of the person's avatar
    icons: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.func])),

    // Descriptive text to be displayed besides selection element
    descriptiveText: PropTypes.string,

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
