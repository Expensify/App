import React from 'react';
import PropTypes from 'prop-types';

import Text from './Text';
import * as EmojiUtils from '../libs/EmojiUtils';


const propTypes = {
    /** Text to display */
    children: PropTypes.string,

    /** Styles to be assigned to Container */
    style: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    children: null,
    style: {},
};

const EmojiText = props => (
    <Text style={props.style}>{EmojiUtils.escapeEmojiFromText(props.children)}</Text>
);

EmojiText.propTypes = propTypes;
EmojiText.defaultProps = defaultProps;
EmojiText.displayName = 'EmojiText';

export default EmojiText;
