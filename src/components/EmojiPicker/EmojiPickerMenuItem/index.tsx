import React, {useEffect, useRef, useState} from 'react';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import * as Browser from '@libs/Browser';
import getButtonState from '@libs/getButtonState';
import CONST from '@src/CONST';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import type EmojiPickerMenuItemProps from './types';

function EmojiPickerMenuItem({emoji, onPress, onHoverIn, onHoverOut, onFocus, onBlur, isFocused, isHighlighted}: EmojiPickerMenuItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
    const StyleUtils = useStyleUtils();
    const themeStyles = useThemeStyles();

    const focusAndScroll = () => {
        ref?.current?.focus({preventScroll: true});
        ref?.current?.scrollIntoView({block: 'nearest'});
    }

    useEffect(() => {
        if(!isFocused) {
            return;
        }
        focusAndScroll();
    }, [isFocused])

    
    return (
        <PressableWithoutFeedback
            shouldUseAutoHitSlop={false}
            onPress={() => onPress(emoji)}
            // In order to prevent haptic feedback, pass empty callback as onLongPress  Please refer https://github.com/necolas/react-native-web/issues/2349#issuecomment-1195564240
            onLongPress={Browser.isMobileChrome() ? () => {} : undefined}
            onPressOut={Browser.isMobile() ? onHoverOut : undefined}
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
            ref={ref}
            style={({pressed}) => [
                isFocused ? themeStyles.emojiItemKeyboardHighlighted : {},
                isHovered || isHighlighted ? themeStyles.emojiItemHighlighted : {},
                Browser.isMobile() && StyleUtils.getButtonBackgroundColorStyle(getButtonState(false, pressed)),
                themeStyles.emojiItem,
            ]}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            accessibilityLabel={emoji!}
            role={CONST.ROLE.BUTTON}
        >
            <Text style={[themeStyles.emojiText]}>{emoji}</Text>
        </PressableWithoutFeedback>
    );
    
}

// Significantly speeds up re-renders of the EmojiPickerMenu's FlatList
// by only re-rendering at most two EmojiPickerMenuItems that are highlighted/un-highlighted per user action.
export default React.memo(EmojiPickerMenuItem);
