import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import withStyleUtils, {withStyleUtilsPropTypes} from '@components/withStyleUtils';
import withThemeStyles, {withThemeStylesPropTypes} from '@components/withThemeStyles';
import * as Browser from '@libs/Browser';
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

    /** Whether this menu item is currently focused or not */
    isFocused: PropTypes.bool,

    /** Whether the menu item should be highlighted or not */
    isHighlighted: PropTypes.bool,

    ...withThemeStylesPropTypes,
    ...withStyleUtilsPropTypes,
};

function EmojiPickerMenuItem(props) {

// class EmojiPickerMenuItem extends PureComponent {
    // constructor(props) {
    //     super(props);

    //     ref = null;
    //     this.focusAndScroll = this.focusAndScroll.bind(this);
    //     this.state = {
    //         isHovered: false,
    //     };
    // }
    const [isHovered, setIsHovered] = useState(false);
    const ref = useRef(null);

    const focusAndScroll = () => {
        ref.focus({preventScroll: true});
        ref.scrollIntoView({block: 'nearest'});
    }

    useEffect(() => {
        if(!props.isFocused) {
            return;
        }
        focusAndScroll();
    }, [props.isFocused])

    
        return (
            <PressableWithoutFeedback
                shouldUseAutoHitSlop={false}
                onPress={() => props.onPress(props.emoji)}
                // In order to prevent haptic feedback, pass empty callback as onLongPress props. Please refer https://github.com/necolas/react-native-web/issues/2349#issuecomment-1195564240
                onLongPress={Browser.isMobileChrome() ? () => {} : undefined}
                onPressOut={Browser.isMobile() ? props.onHoverOut : undefined}
                onHoverIn={() => {
                    if (props.onHoverIn) {
                        props.onHoverIn();
                    }

                    setIsHovered(true);
                }}
                onHoverOut={() => {
                    if (props.onHoverOut) {
                        props.onHoverOut();
                    }

                    setIsHovered(false);
                }}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
                ref={(el) => (ref.current = el)}
                style={({pressed}) => [
                    props.isFocused ? props.themeStyles.emojiItemKeyboardHighlighted : {},
                    isHovered || props.isHighlighted ? props.themeStyles.emojiItemHighlighted : {},
                    Browser.isMobile() && props.StyleUtils.getButtonBackgroundColorStyle(getButtonState(false, pressed)),
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
    withStyleUtils(
        React.memo(
            EmojiPickerMenuItem,
            (prevProps, nextProps) => prevProps.isFocused === nextProps.isFocused && prevProps.isHighlighted === nextProps.isHighlighted && prevProps.emoji === nextProps.emoji,
        ),
    ),
);
