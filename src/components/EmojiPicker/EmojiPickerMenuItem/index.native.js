import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import withStyleUtils, {withStyleUtilsPropTypes} from '@components/withStyleUtils';
import withThemeStyles, {withThemeStylesPropTypes} from '@components/withThemeStyles';
import getButtonState from '@libs/getButtonState';
import CONST from '@src/CONST';

const propTypes = {
    /** The unicode that is used to display the emoji */
    emoji: PropTypes.string.isRequired,

    /** The function to call when an emoji is selected */
    onPress: PropTypes.func.isRequired,

    /** Handles what to do when we hover over this item with our cursor */
    onHoverIn: PropTypes.func,

    /** Handles what to do when the hover is out */
    onHoverOut: PropTypes.func,

    /** Handles what to do when the pressable is focused */
    onFocus: PropTypes.func,

    /** Handles what to do when the pressable is blurred */
    onBlur: PropTypes.func,

    /** Whether this menu item is currently highlighted or not */
    isHighlighted: PropTypes.bool,

    /** Whether this menu item is currently focused or not */
    isFocused: PropTypes.bool,

    /** Whether the emoji is highlighted by the keyboard/mouse */
    isUsingKeyboardMovement: PropTypes.bool,

    ...withThemeStylesPropTypes,
    ...withStyleUtilsPropTypes,
};

function EmojiPickerMenuItem(props) {

    const ref = useRef(null);

    useEffect(() => {
        if(!props.isFocused) {
            return;
        }
        ref.focus();
    }, [props.isFocused])

    return (
        <PressableWithoutFeedback
            shouldUseAutoHitSlop={false}
            onPress={() => props.onPress(props.emoji)}
            onHoverIn={props.onHoverIn}
            onHoverOut={props.onHoverOut}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            ref={(el) => (ref.current = el)}
            style={({pressed}) => [
                props.StyleUtils.getButtonBackgroundColorStyle(getButtonState(false, pressed)),
                props.isHighlighted && props.isUsingKeyboardMovement ? props.themeStyles.emojiItemKeyboardHighlighted : {},
                props.isHighlighted && !props.isUsingKeyboardMovement ? props.themeStyles.emojiItemHighlighted : {},
                props.themeStyles.emojiItem,
            ]}
            accessibilityLabel={props.emoji}
            role={CONST.ROLE.BUTTON}
        >
            <Text style={[props.themeStyles.emojiText]}>{props.emoji}</Text>
        </PressableWithoutFeedback>
    );
}

EmojiPickerMenuItem.propTypes = propTypes;
EmojiPickerMenuItem.defaultProps = {
    isHighlighted: false,
    isFocused: false,
    isUsingKeyboardMovement: false,
    onHoverIn: () => {},
    onHoverOut: () => {},
    onFocus: () => {},
    onBlur: () => {},
};

// Significantly speeds up re-renders of the EmojiPickerMenu's FlatList
// by only re-rendering at most two EmojiPickerMenuItems that are highlighted/un-highlighted per user action.
export default withThemeStyles(
    withStyleUtils(
        React.memo(
            EmojiPickerMenuItem,
            (prevProps, nextProps) =>
                prevProps.isHighlighted === nextProps.isHighlighted && prevProps.emoji === nextProps.emoji && prevProps.isUsingKeyboardMovement === nextProps.isUsingKeyboardMovement,
        ),
    ),
);
