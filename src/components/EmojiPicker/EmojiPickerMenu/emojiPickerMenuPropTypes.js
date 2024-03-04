import PropTypes from 'prop-types';

const emojiPickerMenuPropTypes = {
    /** Function to add the selected emoji to the main compose text input */
    onEmojiSelected: PropTypes.func.isRequired,
};

export default emojiPickerMenuPropTypes;
