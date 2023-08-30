import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import getButtonState from '../../../libs/getButtonState';
import Text from '../../Text';
import PressableWithoutFeedback from '../../Pressable/PressableWithoutFeedback';
import CONST from '../../../CONST';

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
};

class EmojiPickerMenuItem extends PureComponent {
    constructor(props) {
        super(props);

        this.ref = null;
    }

    componentDidMount() {
        if (!this.props.isFocused) {
            return;
        }
        this.ref.focus();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isFocused === this.props.isFocused) {
            return;
        }
        if (!this.props.isFocused) {
            return;
        }
        this.ref.focus();
    }

    render() {
        return (
            <PressableWithoutFeedback
                shouldUseAutoHitSlop={false}
                onPress={() => this.props.onPress(this.props.emoji)}
                onHoverIn={this.props.onHoverIn}
                onHoverOut={this.props.onHoverOut}
                onFocus={this.props.onFocus}
                onBlur={this.props.onBlur}
                ref={(ref) => (this.ref = ref)}
                style={({pressed}) => [
                    StyleUtils.getButtonBackgroundColorStyle(getButtonState(false, pressed)),
                    this.props.isHighlighted && this.props.isUsingKeyboardMovement ? styles.emojiItemKeyboardHighlighted : {},
                    this.props.isHighlighted && !this.props.isUsingKeyboardMovement ? styles.emojiItemHighlighted : {},
                    styles.emojiItem,
                ]}
                accessibilityLabel={this.props.emoji}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
            >
                <Text style={[styles.emojiText]}>{this.props.emoji}</Text>
            </PressableWithoutFeedback>
        );
    }
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
export default React.memo(
    EmojiPickerMenuItem,
    (prevProps, nextProps) =>
        prevProps.isHighlighted === nextProps.isHighlighted && prevProps.emoji === nextProps.emoji && prevProps.isUsingKeyboardMovement === nextProps.isUsingKeyboardMovement,
);
