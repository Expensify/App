import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import Text from './Text';
import * as EmojiUtils from '../libs/EmojiUtils';
import * as StyleUtils from '../styles/StyleUtils';
import stylePropTypes from '../styles/stylePropTypes';

const propTypes = {
    /** The message text to render */
    text: PropTypes.string.isRequired,

    /** Text additional style */
    style: stylePropTypes,
};

const defaultProps = {
    style: [],
};

const TextEmoji = (props) => {
    const propsStyle = StyleUtils.parseStyleAsArray(props.style);

    if (!EmojiUtils.isEmoji(props.text)) {
        return (
            <Text>
                {props.text}
            </Text>
        );
    }

    return _.map([...Str.htmlDecode(props.text)], ((char, index) => (
        <Text key={char + index} style={EmojiUtils.isEmoji(char) ? propsStyle : undefined}>
            {char}
        </Text>
    )));
};

TextEmoji.displayName = 'TextEmoji';
TextEmoji.defaultProps = defaultProps;
TextEmoji.propTypes = propTypes;

export default TextEmoji;
