import React from 'react';
import PropTypes from 'prop-types';
import {Pressable, Text} from 'react-native';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';

const propTypes = {
    // The unicode that is used to display the emoji
    emoji: PropTypes.string.isRequired,

    // The function to call when an emoji is selected
    onPress: PropTypes.func.isRequired,
};

const EmojiPickerMenuItem = props => (
    <Pressable
        onPress={() => props.onPress(props.emoji)}
        style={({hovered}) => ([
            styles.emojiItem,
            hovered && {backgroundColor: themeColors.buttonHoveredBG},
        ])}
    >
        <Text style={styles.emojiText}>{props.emoji}</Text>
    </Pressable>
);

EmojiPickerMenuItem.propTypes = propTypes;
EmojiPickerMenuItem.displayName = 'EmojiPickerMenuItem';

export default EmojiPickerMenuItem;
