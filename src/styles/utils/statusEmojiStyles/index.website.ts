import * as Browser from '@libs/Browser';
import type StatusEmojiStyles from './types';

const statusEmojiStyles: StatusEmojiStyles = Browser.isMobile()
    ? {}
    : {
          marginTop: 2,
      };

export default statusEmojiStyles;
