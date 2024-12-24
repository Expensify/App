import FontUtils from '@styles/utils/FontUtils';
import type EmojiDefaultStyles from './types';

const emojiDefaultStyles: EmojiDefaultStyles = {
    ...FontUtils.fontFamily.platform.EXP_NEUE,
    textDecorationLine: 'none',
};

export default emojiDefaultStyles;
