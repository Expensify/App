import React, {useEffect, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text as RNText, View} from 'react-native';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobile, isMobileChrome} from '@libs/Browser';
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
}: EmojiPickerMenuItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const ref = useRef<HTMLDivElement | View | RNText | null>(null);
    const StyleUtils = useStyleUtils();
    const themeStyles = useThemeStyles();

    const focusAndScroll = () => {
        if (ref.current && 'focus' in ref.current) {
            ref.current.focus({preventScroll: true});
        }
        if (ref.current && 'scrollIntoView' in ref.current) {
            ref.current.scrollIntoView({block: 'nearest'});
        }
    };

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        focusAndScroll();
    }, [isFocused]);

    return (
        <PressableWithoutFeedback
            shouldUseAutoHitSlop={false}
            onPress={() => onPress(emoji)}
            // In order to prevent haptic feedback, pass empty callback as onLongPress  Please refer https://github.com/necolas/react-native-web/issues/2349#issuecomment-1195564240
            onLongPress={isMobileChrome() ? () => {} : undefined}
            onPressOut={isMobile() ? onHoverOut : undefined}
            onHoverIn={() => {
                if (onHoverIn) {
                    onHoverIn();
                }

                setIsHovered(true);
            }}
            onHoverOut={() => {
                if (onHoverOut) {
                    onHoverOut();
                }

                setIsHovered(false);
            }}
            onFocus={onFocus}
            onBlur={onBlur}
            ref={(el) => {
                ref.current = el ?? null;
            }}
            style={({pressed}) => [
                isFocused || isHovered || isHighlighted ? themeStyles.emojiItemHighlighted : {},
                isMobile() && StyleUtils.getButtonBackgroundColorStyle(getButtonState(false, pressed)),
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
    (prevProps, nextProps) => prevProps.isFocused === nextProps.isFocused && prevProps.isHighlighted === nextProps.isHighlighted && prevProps.emoji === nextProps.emoji,
);
