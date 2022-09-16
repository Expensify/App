import React from 'react';
import PropTypes from 'prop-types';
import {Pressable} from 'react-native';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import getButtonState from '../../libs/getButtonState';
import Hoverable from '../Hoverable';
import Text from '../Text';

const propTypes = {
    /** The unicode that is used to display the emoji */
    emoji: PropTypes.string.isRequired,

    /** The function to call when an emoji is selected */
    onPress: PropTypes.func.isRequired,

    /** Handles what to do when we hover over this item with our cursor */
    onHover: PropTypes.func,

    /** Handles what to do when the hover is out */
    onHoverOut: PropTypes.func,

    /** Whether this menu item is currently highlighted or not */
    isHighlighted: PropTypes.bool,
};

const EmojiPickerMenuItem = props => (
    <Pressable
        onPress={() => props.onPress(props.emoji)}
        style={({
            pressed,
        }) => ([
            styles.p1,
            StyleUtils.getButtonBackgroundColorStyle(getButtonState(false, pressed)),
            props.isHighlighted ? styles.emojiItemHighlighted : {},
            styles.emojiItem,
        ])}
    >
        <Hoverable onHoverIn={props.onHover} onHoverOut={props.onHoverOut}>
            <Text style={[styles.emojiText]}>
                {props.emoji}
            </Text>
        </Hoverable>
    </Pressable>

);
EmojiPickerMenuItem.propTypes = propTypes;
EmojiPickerMenuItem.displayName = 'EmojiPickerMenuItem';
EmojiPickerMenuItem.defaultProps = {
    isHighlighted: false,
    onHover: () => {},
    onHoverOut: () => {},
};

// Significantly speeds up re-renders of the EmojiPickerMenu's FlatList
// by only re-rendering at most two EmojiPickerMenuItems that are highlighted/un-highlighted per user action.
export default React.memo(
    EmojiPickerMenuItem,
    (prevProps, nextProps) => prevProps.isHighlighted === nextProps.isHighlighted
                                && prevProps.emoji === nextProps.emoji,
);
