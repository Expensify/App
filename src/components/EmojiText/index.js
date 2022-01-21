import React from 'react';
import Text from '../Text';
import * as baseTextPropTypes from '../Text/baseTextPropTypes';
import * as EmojiUtils from '../../libs/EmojiUtils';

// This is a workaround on the Chrome browser issue when rendering emojis with font-weight greater than 500
// More info: https://bugs.chromium.org/p/chromium/issues/detail?id=1266022
// Text that contains emojis is split so that each emoji is wrapped with a Text component with normal font-weight
const EmojiText = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Text {...props}>{EmojiUtils.escapeEmojiFromText(props.children)}</Text>
);

EmojiText.propTypes = baseTextPropTypes.propTypes;
EmojiText.defaultProps = baseTextPropTypes.defaultProps;
EmojiText.displayName = 'EmojiText';

export default EmojiText;
