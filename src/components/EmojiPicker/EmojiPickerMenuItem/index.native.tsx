import React, {useEffect, useRef} from 'react';
import type {View} from 'react-native';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import CONST from '@src/CONST';
import type EmojiPickerMenuItemProps from './types';

function EmojiPickerMenuItem({
    emoji,
    onPress,
    onHoverIn = () => {},
    onHoverOut = () => {},
    onFocus = () => {},
    onBlur = () => {},
    isFocused = false,
    isHighlighted = false,
    isUsingKeyboardMovement = false,
}: EmojiPickerMenuItemProps) {
    const ref = useRef<View>(null);
    const StyleUtils = useStyleUtils();
    const themeStyles = useThemeStyles();

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        ref?.current?.focus();
    }, [isFocused]);

    return (
        <PressableWithoutFeedback
            shouldUseAutoHitSlop={false}
            onPress={() => onPress(emoji)}
            onHoverIn={onHoverIn}
            onHoverOut={onHoverOut}
            onFocus={onFocus}
            onBlur={onBlur}
            ref={ref}
            style={({pressed}) => [
                StyleUtils.getButtonBackgroundColorStyle(getButtonState(false, pressed)),
                isHighlighted && isUsingKeyboardMovement && themeStyles.emojiItemKeyboardHighlighted,
                isHighlighted && !isUsingKeyboardMovement && themeStyles.emojiItemHighlighted,
                themeStyles.emojiItem,
            ]}
            accessibilityLabel={emoji}
            role={CONST.ROLE.BUTTON}
            sentryLabel={CONST.SENTRY_LABEL.EMOJI_PICKER.MENU_ITEM}
        >
            <Text style={[themeStyles.emojiText]}>{emoji}</Text>
        </PressableWithoutFeedback>
    );
}

EmojiPickerMenuItem.displayName = 'EmojiPickerMenuItem';

// Significantly speeds up re-renders of the EmojiPickerMenu's FlatList
// by only re-rendering at most two EmojiPickerMenuItems that are highlighted/un-highlighted per user action.
export default React.memo(
    EmojiPickerMenuItem,
    (prevProps, nextProps) =>
        prevProps.isHighlighted === nextProps.isHighlighted && prevProps.emoji === nextProps.emoji && prevProps.isUsingKeyboardMovement === nextProps.isUsingKeyboardMovement,
);
