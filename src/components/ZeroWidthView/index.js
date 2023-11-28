import PropTypes from 'prop-types';
import React from 'react';
import Text from '@components/Text';
import * as Browser from '@libs/Browser';
import * as EmojiUtils from '@libs/EmojiUtils';

const propTypes = {
    /** If this is the Concierge chat, we'll open the modal for requesting a setup call instead of showing popover menu */
    text: PropTypes.string,

    /** URL to the assigned guide's appointment booking calendar */
    displayAsGroup: PropTypes.bool,
};

const defaultProps = {
    text: '',
    displayAsGroup: false,
};

function ZeroWidthView({text, displayAsGroup}) {
    const firstLetterIsEmoji = EmojiUtils.isFirstLetterEmoji(text);
    if (firstLetterIsEmoji && !displayAsGroup && !Browser.isMobile()) {
        return <Text>&#x200b;</Text>;
    }
    return null;
}

ZeroWidthView.propTypes = propTypes;
ZeroWidthView.defaultProps = defaultProps;
ZeroWidthView.displayName = 'ZeroWidthView';

export default ZeroWidthView;
