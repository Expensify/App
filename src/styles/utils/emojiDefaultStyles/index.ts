// eslint-disable-next-line no-restricted-imports
import display from '@styles/utils/display';
import type EmojiDefaultStyles from './types';

const emojiDefaultStyles: EmojiDefaultStyles = {
    fontStyle: 'normal',
    fontWeight: 'normal',
    ...display.dInlineFlex,
};

export default emojiDefaultStyles;
