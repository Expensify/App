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
    children: PropTypes.string.isRequired,

    /** Text additional style */
    style: stylePropTypes,
};

const defaultProps = {
    style: [],
};

const TextEmoji = (props) => {
    if (!EmojiUtils.isEmoji(props.children)) {
        return (
            <Text>
                {props.children}
            </Text>
        );
    }

    const propsStyle = StyleUtils.parseStyleAsArray(props.style);

    return _.map([...Str.htmlDecode(props.children)], ((char, index) => (
        <Text key={`${char}_${index}`} style={EmojiUtils.isEmoji(char) ? propsStyle : undefined}>
            {char}
        </Text>
    )));
};

TextEmoji.displayName = 'TextEmoji';
TextEmoji.defaultProps = defaultProps;
TextEmoji.propTypes = propTypes;

export default TextEmoji;
