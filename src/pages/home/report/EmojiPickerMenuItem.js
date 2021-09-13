import React from 'react';
import PropTypes from 'prop-types';
import {Pressable} from 'react-native';
import styles, {getButtonBackgroundColorStyle} from '../../../styles/styles';
import getButtonState from '../../../libs/getButtonState';
import Hoverable from '../../../components/Hoverable';
import Text from '../../../components/Text';

const propTypes = {
    /** The unicode that is used to display the emoji */
    emoji: PropTypes.string.isRequired,

    /** The function to call when an emoji is selected */
    onPress: PropTypes.func.isRequired,

    /** Handles what to do when we hover over this item with our cursor */
    onHover: PropTypes.func,

    /** Whether this menu item is currently highlighted or not */
    isHighlighted: PropTypes.bool,

    /** Override default emojiItem style */
    // eslint-disable-next-line react/forbid-prop-types
    emojiItemStyle: PropTypes.any,

};

const EmojiPickerMenuItem = props => (
    <Pressable
        onPress={() => props.onPress(props.emoji)}
        style={({
            pressed,
        }) => ([
            styles.pv1,
            getButtonBackgroundColorStyle(getButtonState(false, pressed)),
            props.isHighlighted ? styles.emojiItemHighlighted : {},
            props.emojiItemStyle ? props.emojiItemStyle : styles.emojiItem,
        ])}
    >
        <Hoverable onHoverIn={props.onHover}>
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
    emojiItemStyle: undefined,
};

// Significantly speeds up re-renders of the EmojiPickerMenu's FlatList
// by only re-rendering at most two EmojiPickerMenuItems that are highlighted/un-highlighted per user action.
export default React.memo(
    EmojiPickerMenuItem,
    (prevProps, nextProps) => prevProps.isHighlighted === nextProps.isHighlighted
                                && prevProps.emoji === nextProps.emoji,
);
