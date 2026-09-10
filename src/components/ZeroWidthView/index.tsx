import Text from '@components/Text';

import * as Browser from '@libs/Browser';
import * as EmojiUtils from '@libs/EmojiUtils';

import React from 'react';

import type ZeroWidthViewProps from './types';

function ZeroWidthView({text = '', displayAsGroup = false}: ZeroWidthViewProps) {
    const firstLetterIsEmoji = EmojiUtils.isFirstLetterEmoji(text);
    if (firstLetterIsEmoji && !displayAsGroup && !Browser.isMobile()) {
        return <Text>&#x200b;</Text>;
    }
    return null;
}

export default ZeroWidthView;
