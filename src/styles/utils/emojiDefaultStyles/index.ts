// eslint-disable-next-line no-restricted-imports
import display from '@styles/utils/display';
import FontUtils from '@styles/utils/FontUtils';
import type EmojiDefaultStyles from './types';

const emojiDefaultStyles: EmojiDefaultStyles = {
    fontStyle: 'normal',
    fontWeight: FontUtils.fontWeight.normal,
    ...display.dInlineFlex,
};

export default emojiDefaultStyles;
