import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import getButtonState from '../../../libs/getButtonState';
import Text from '../../Text';
import PressableWithoutFeedback from '../../Pressable/PressableWithoutFeedback';
import CONST from '../../../CONST';
import * as Browser from '../../../libs/Browser';

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
                    this.props.isFocused ? styles.emojiItemKeyboardHighlighted : {},
                    this.state.isHovered ? styles.emojiItemHighlighted : {},
                    Browser.isMobile() && StyleUtils.getButtonBackgroundColorStyle(getButtonState(false, pressed)),
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
    isFocused: false,
    onHoverIn: () => {},
    onHoverOut: () => {},
    onFocus: () => {},
    onBlur: () => {},
};

// Significantly speeds up re-renders of the EmojiPickerMenu's FlatList
// by only re-rendering at most two EmojiPickerMenuItems that are highlighted/un-highlighted per user action.
export default React.memo(EmojiPickerMenuItem, (prevProps, nextProps) => prevProps.isFocused === nextProps.isFocused && prevProps.emoji === nextProps.emoji);
