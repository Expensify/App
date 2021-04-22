import React from 'react';
import PropTypes from 'prop-types';
import {Pressable, Text} from 'react-native';
import styles, {getButtonBackgroundColorStyle} from '../../../styles/styles';
import getButtonState from '../../../libs/getButtonState';
import CONST from '../../../CONST';

const propTypes = {
    // The unicode that is used to display the emoji
    emoji: PropTypes.string.isRequired,

    // The function to call when an emoji is selected
    onPress: PropTypes.func.isRequired,

    // Whether this menu item is highlighted or not
    isHighlighted: PropTypes.bool.isRequired,
};

const EmojiPickerMenuItem = (props) => {
    const {code, header} = props.emoji;
    if (code === CONST.EMOJI_SPACER) {
        return null;
    }

    if (header) {
        return (
            <Text style={styles.emojiHeaderStyle}>
                {code}
            </Text>
        );
    }
    return (
        <Pressable
            onPress={() => props.onPress(code)}
            style={({
                hovered,
                pressed,
            }) => ([
                styles.emojiItem,
                getButtonBackgroundColorStyle(getButtonState(hovered, pressed)),
                props.isHighlighted ? styles.emojiItemHighlighted : {},
            ])}
        >
            <Text style={styles.emojiText}>{code}</Text>
        </Pressable>
    );
};

EmojiPickerMenuItem.propTypes = propTypes;
EmojiPickerMenuItem.displayName = 'EmojiPickerMenuItem';

export default React.memo(
    EmojiPickerMenuItem,
    (prevProps, nextProps) => prevProps.isHighlighted === nextProps.isHighlighted,
);
