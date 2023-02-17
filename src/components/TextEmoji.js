import React from 'react';
import PropTypes from 'prop-types';
import {Platform, View} from 'react-native';
import _ from 'underscore';
import Text from './Text';
import * as EmojiUtils from '../libs/EmojiUtils';
import * as StyleUtils from '../styles/StyleUtils';
import stylePropTypes from '../styles/stylePropTypes';

const propTypes = {
    /** The message text to render */
    children: PropTypes.string.isRequired,

    /** The message text additional style */
    style: stylePropTypes,
};

const defaultProps = {
    style: [],
};

const TextEmoji = (props) => {
    const words = EmojiUtils.containsEmoji(props.children);
    const propsStyle = StyleUtils.parseStyleAsArray(props.style);

    return _.map(words, ({text, isEmoji}, index) => (isEmoji ? (
        <View key={`${text}_${index}`} style={Platform.OS !== 'web' && propsStyle}>
            <Text style={propsStyle}>
                {text}
            </Text>
        </View>
    )
        : (
            <Text key={`${text}_${index}`}>
                {text}
            </Text>
        )));
};

TextEmoji.displayName = 'TextEmoji';
TextEmoji.defaultProps = defaultProps;
TextEmoji.propTypes = propTypes;

export default TextEmoji;
