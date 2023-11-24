import React, {useCallback} from 'react';
import {GestureResponderEvent, PressableStateCallbackType, StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Text from './Text';

type BadgeProps = {
    /** Is Success type */
    success?: boolean;

    /** Is Error type */
    error?: boolean;

    /** Whether badge is clickable */
    pressable?: boolean;

    /** Text to display in the Badge */
    text: string;

    /** Text to display in the Badge */
    environment?: string;

    /** Styles for Badge */
    badgeStyles?: StyleProp<ViewStyle>;

    /** Styles for Badge Text */
    textStyles?: StyleProp<TextStyle>;

    /** Callback to be called on onPress */
    onPress?: (event?: GestureResponderEvent | KeyboardEvent) => void;
};

function Badge({success = false, error = false, pressable = false, text, environment = CONST.ENVIRONMENT.DEV, badgeStyles, textStyles, onPress = () => {}}: BadgeProps) {
    const styles = useThemeStyles();
    const textColorStyles = success || error ? styles.textWhite : undefined;
    const Wrapper = pressable ? PressableWithoutFeedback : View;

    const wrapperStyles: (state: PressableStateCallbackType) => StyleProp<ViewStyle> = useCallback(
        ({pressed}) => [styles.badge, styles.ml2, StyleUtils.getBadgeColorStyle(success, error, pressed, environment === CONST.ENVIRONMENT.ADHOC), badgeStyles],
        [styles.badge, styles.ml2, success, error, environment, badgeStyles],
    );

    return (
        <Wrapper
            style={pressable ? wrapperStyles : wrapperStyles({focused: false, hovered: false, isDisabled: false, isScreenReaderActive: false, pressed: false})}
            onPress={onPress}
            role={pressable ? CONST.ACCESSIBILITY_ROLE.BUTTON : CONST.ACCESSIBILITY_ROLE.TEXT}
            accessibilityLabel={pressable ? text : undefined}
            aria-label={!pressable ? text : undefined}
            accessible={false}
        >
            <Text
                style={[styles.badgeText, textColorStyles, textStyles]}
                numberOfLines={1}
            >
                {text}
            </Text>
        </Wrapper>
    );
}

Badge.displayName = 'Badge';

export default Badge;
