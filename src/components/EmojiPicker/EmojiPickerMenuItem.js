import React from 'react';
import PropTypes from 'prop-types';
import {Pressable} from 'react-native';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import getButtonState from '../../libs/getButtonState';
import Text from '../Text';

const propTypes = {
    /** The unicode that is used to display the emoji */
    emoji: PropTypes.string.isRequired,

    /** The function to call when an emoji is selected */
    onPress: PropTypes.func.isRequired,

    /** Handles what to do when we hover over this item with our cursor */
    onHoverIn: PropTypes.func,

    /** Handles what to do when the hover is out */
    onHoverOut: PropTypes.func,

    /** Whether this menu item is currently highlighted or not */
    isHighlighted: PropTypes.bool,

    /** Whether the emoji is highlighted by the keyboard/mouse */
    isUsingKeyboardMovement: PropTypes.bool,
};

const EmojiPickerMenuItem = props => (
    <Pressable
        onPress={() => props.onPress(props.emoji)}
        onHoverIn={props.onHoverIn}
        onHoverOut={props.onHoverOut}
        style={({
            pressed,
        }) => ([
            StyleUtils.getButtonBackgroundColorStyle(getButtonState(false, pressed)),
            props.isHighlighted && props.isUsingKeyboardMovement ? styles.emojiItemKeyboardHighlighted : {},
            props.isHighlighted && !props.isUsingKeyboardMovement ? styles.emojiItemHighlighted : {},
            styles.emojiItem,
        ])}
    >
        <Text style={[styles.emojiText]}>
            {props.emoji}
        </Text>
    </Pressable>

);
EmojiPickerMenuItem.propTypes = propTypes;
EmojiPickerMenuItem.displayName = 'EmojiPickerMenuItem';
EmojiPickerMenuItem.defaultProps = {
    isHighlighted: false,
    isUsingKeyboardMovement: false,
    onHoverIn: () => {},
    onHoverOut: () => {},
};

// Significantly speeds up re-renders of the EmojiPickerMenu's FlatList
// by only re-rendering at most two EmojiPickerMenuItems that are highlighted/un-highlighted per user action.
export default React.memo(
    EmojiPickerMenuItem,
    (prevProps, nextProps) => prevProps.isHighlighted === nextProps.isHighlighted
                                && prevProps.emoji === nextProps.emoji,
);
