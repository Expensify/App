import React from 'react';
import PropTypes from 'prop-types';

import Text from './Text';
import * as EmojiUtils from '../libs/EmojiUtils';


const propTypes = {
    /** Text to display */
    children: PropTypes.string,
};

const defaultProps = {
    children: null,
};

const EmojiText = props => (
    <Text>{EmojiUtils.escapeEmojiFromText(props.children)}</Text>
);

EmojiText.propTypes = propTypes;
EmojiText.defaultProps = defaultProps;
EmojiText.displayName = 'EmojiText';

export default EmojiText;
