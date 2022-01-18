import React from 'react';
import PropTypes from 'prop-types';

import Text from '../Text';
import * as EmojiUtils from '../../libs/EmojiUtils';
import stylePropTypes from '../../styles/stylePropTypes';
import themeColors from '../../styles/themes/default';
import variables from '../../styles/variables';

const propTypes = {
    /** The color of the text */
    color: PropTypes.string,

    /** The size of the text */
    fontSize: PropTypes.number,

    /** The alignment of the text */
    // eslint-disable-next-line react/forbid-prop-types
    textAlign: PropTypes.any,

    /** Text containing emojis */
    children: PropTypes.string.isRequired,

    /** The family of the font to use */
    family: PropTypes.string,

    /** Any additional styles to apply */
    style: stylePropTypes,
};
const defaultProps = {
    color: themeColors.text,
    fontSize: variables.fontSizeNormal,
    family: 'GTA',
    style: {},
};

// This is a workaround on the Chrome browser issue when rendering emojis with font-weight greater than 500
// More info: https://bugs.chromium.org/p/chromium/issues/detail?id=1266022
// Text that contains emojis is split so that each emoji is wrapped with a Text component with normal font-weight
const EmojiText = props => (
    <Text {...props}>{EmojiUtils.escapeEmojiFromText(props.children)}</Text>
);

EmojiText.propTypes = propTypes;
EmojiText.defaultProps = defaultProps;
EmojiText.displayName = 'EmojiText';

export default EmojiText;
