import PropTypes from 'prop-types';

const propTypes = {
    /** Hide the ReactionList modal popover */
    onClose: PropTypes.func,

    /** The emoji codes */
    emojiCodes: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** The name of the emoji */
    emojiName: PropTypes.string.isRequired,

    /** Count of the emoji */
    emojiCount: PropTypes.number.isRequired,
};

export default propTypes;
