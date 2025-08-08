// eslint-disable-next-line no-restricted-imports
import FontUtils from '@styles/utils/FontUtils';
import type EmojiDefaultStyles from './types';

const emojiDefaultStyles: EmojiDefaultStyles = {
    ...FontUtils.fontFamily.platform.EXP_NEUE,
    textDecoration: 'none',
};

export default emojiDefaultStyles;
