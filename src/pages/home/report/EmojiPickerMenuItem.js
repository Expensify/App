import React from 'react';
import PropTypes from 'prop-types';
import {Pressable, Text} from 'react-native';
import styles, {getButtonBackgroundColorStyle} from '../../../styles/styles';
import getButtonState from '../../../libs/getButtonState';

const propTypes = {
    // The unicode that is used to display the emoji
    emoji: PropTypes.string.isRequired,

    // The function to call when an emoji is selected
    onPress: PropTypes.func.isRequired,
};

const EmojiPickerMenuItem = props => (
    <Pressable
        onPress={() => props.onPress(props.emoji)}
        style={({hovered, pressed}) => ([
            styles.emojiItem,
            getButtonBackgroundColorStyle(getButtonState(hovered, pressed)),
        ])}
    >
        <Text style={styles.emojiText}>{props.emoji}</Text>
    </Pressable>
);

EmojiPickerMenuItem.propTypes = propTypes;
EmojiPickerMenuItem.displayName = 'EmojiPickerMenuItem';

export default EmojiPickerMenuItem;
