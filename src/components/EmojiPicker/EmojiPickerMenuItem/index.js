import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import withThemeStyles, {withThemeStylesPropTypes} from '@components/withThemeStyles';
import * as Browser from '@libs/Browser';
import getButtonState from '@libs/getButtonState';
import * as StyleUtils from '@styles/StyleUtils';
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

    /** Whether this menu item is currently focused or not */
    isFocused: PropTypes.bool,

    /** Whether the menu item should be highlighted or not */
    isHighlighted: PropTypes.bool,
    ...withThemeStylesPropTypes,
};

class EmojiPickerMenuItem extends PureComponent {
    constructor(props) {
        super(props);

        this.ref = null;
        this.focusAndScroll = this.focusAndScroll.bind(this);
        this.state = {
            isHovered: false,
        };
    }

    componentDidMount() {
        if (!this.props.isFocused) {
            return;
        }
        this.focusAndScroll();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isFocused === this.props.isFocused) {
            return;
        }
        if (!this.props.isFocused) {
            return;
        }

        this.focusAndScroll();
    }

    focusAndScroll() {
        this.ref.focus({preventScroll: true});
        this.ref.scrollIntoView({block: 'nearest'});
    }

    render() {
        return (
            <PressableWithoutFeedback
                shouldUseAutoHitSlop={false}
                onPress={() => this.props.onPress(this.props.emoji)}
                // In order to prevent haptic feedback, pass empty callback as onLongPress props. Please refer https://github.com/necolas/react-native-web/issues/2349#issuecomment-1195564240
                onLongPress={Browser.isMobileChrome() ? () => {} : undefined}
                onPressOut={Browser.isMobile() ? this.props.onHoverOut : undefined}
                onHoverIn={() => {
                    if (this.props.onHoverIn) {
                        this.props.onHoverIn();
                    }

                    this.setState({isHovered: true});
                }}
                onHoverOut={() => {
                    if (this.props.onHoverOut) {
                        this.props.onHoverOut();
                    }

                    this.setState({isHovered: false});
                }}
                onFocus={this.props.onFocus}
                onBlur={this.props.onBlur}
                ref={(ref) => (this.ref = ref)}
                style={({pressed}) => [
                    this.props.isFocused ? this.props.themeStyles.emojiItemKeyboardHighlighted : {},
                    this.state.isHovered || this.props.isHighlighted ? this.props.themeStyles.emojiItemHighlighted : {},
                    Browser.isMobile() && StyleUtils.getButtonBackgroundColorStyle(getButtonState(false, pressed)),
                    this.props.themeStyles.emojiItem,
                ]}
                accessibilityLabel={this.props.emoji}
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
            >
                <Text style={[this.props.themeStyles.emojiText]}>{this.props.emoji}</Text>
            </PressableWithoutFeedback>
        );
    }
}

EmojiPickerMenuItem.propTypes = propTypes;
EmojiPickerMenuItem.defaultProps = {
    isFocused: false,
    isHighlighted: false,
    onHoverIn: () => {},
    onHoverOut: () => {},
    onFocus: () => {},
    onBlur: () => {},
};

// Significantly speeds up re-renders of the EmojiPickerMenu's FlatList
// by only re-rendering at most two EmojiPickerMenuItems that are highlighted/un-highlighted per user action.
export default withThemeStyles(
    React.memo(
        EmojiPickerMenuItem,
        (prevProps, nextProps) => prevProps.isFocused === nextProps.isFocused && prevProps.isHighlighted === nextProps.isHighlighted && prevProps.emoji === nextProps.emoji,
    ),
);
