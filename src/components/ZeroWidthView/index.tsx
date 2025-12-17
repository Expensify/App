import React from 'react';
import Text from '@components/Text';
import * as Browser from '@libs/Browser';
import * as EmojiUtils from '@libs/EmojiUtils';

type ZeroWidthViewProps = {
    /** If this is the Concierge chat, we'll open the modal for requesting a setup call instead of showing popover menu */
    text?: string;

    /** URL to the assigned guide's appointment booking calendar */
    displayAsGroup?: boolean;
};

function ZeroWidthView({text = '', displayAsGroup = false}: ZeroWidthViewProps) {
    const firstLetterIsEmoji = EmojiUtils.isFirstLetterEmoji(text);
    if (firstLetterIsEmoji && !displayAsGroup && !Browser.isMobile()) {
        return <Text>&#x200b;</Text>;
    }
    return null;
}

export default ZeroWidthView;
