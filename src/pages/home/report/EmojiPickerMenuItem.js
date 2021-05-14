import React from 'react';
import PropTypes from 'prop-types';
import {Pressable, Text} from 'react-native';
import styles, {getButtonBackgroundColorStyle} from '../../../styles/styles';
import getButtonState from '../../../libs/getButtonState';
import Hoverable from '../../../components/Hoverable';

const propTypes = {
    /** The unicode that is used to display the emoji */
    emoji: PropTypes.string.isRequired,

    /** The function to call when an emoji is selected */
    onPress: PropTypes.func.isRequired,

    /** Handles what to do when we hover over this item with our cursor */
    onHover: PropTypes.func.isRequired,

    /** Whether this menu item is currently highlighted or not */
    isHighlighted: PropTypes.bool.isRequired,
};

const EmojiPickerMenuItem = props => (
    <Pressable
        onPress={() => props.onPress(props.emoji)}
        style={({
            pressed,
        }) => ([
            styles.emojiItem,
            getButtonBackgroundColorStyle(getButtonState(false, pressed)),
            props.isHighlighted ? styles.emojiItemHighlighted : {},
        ])}
    >
        <Hoverable onHoverIn={props.onHover}>
            <Text style={styles.emojiText}>{props.emoji}</Text>
        </Hoverable>
    </Pressable>

);

EmojiPickerMenuItem.propTypes = propTypes;
EmojiPickerMenuItem.displayName = 'EmojiPickerMenuItem';

// Significantly speeds up re-renders of the EmojiPickerMenu's FlatList
// by only re-rendering at most two EmojiPickerMenuItems that are highlighted/un-highlighted per user action.
export default React.memo(
    EmojiPickerMenuItem,
    (prevProps, nextProps) => prevProps.isHighlighted === nextProps.isHighlighted,
);
