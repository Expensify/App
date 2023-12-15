import PropTypes from 'prop-types';
import CONST from '@src/CONST';

const emojiPickerMenuPropTypes = {
    /** Function to add the selected emoji to the main compose text input */
    onEmojiSelected: PropTypes.func.isRequired,

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** Stores user's frequently used emojis */
    // eslint-disable-next-line react/forbid-prop-types
    frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.object),
};

const emojiPickerMenuDefaultProps = {
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
    frequentlyUsedEmojis: [],
};

export {emojiPickerMenuDefaultProps, emojiPickerMenuPropTypes};
