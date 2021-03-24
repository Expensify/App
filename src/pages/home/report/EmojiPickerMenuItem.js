import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {TouchableOpacity, Text} from 'react-native';
import styles from '../../../styles/styles';

const propTypes = {
    // The unicode that is used to display the emoji
    emoji: PropTypes.string.isRequired,

    // The function to call when an emoji is selected
    onPress: PropTypes.func.isRequired,
};

const EmojiPickerMenuItem = props => (
    <TouchableOpacity onPress={() => props.onPress(props.emoji)} style={styles.emojiTextWrapper}>
        <Text style={styles.emojiText}>{props.emoji}</Text>
    </TouchableOpacity>
);

EmojiPickerMenuItem.propTypes = propTypes;
EmojiPickerMenuItem.displayName = 'EmojiPickerMenuItem';

export default EmojiPickerMenuItem;
