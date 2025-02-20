import React, {useCallback} from 'react';
import type {GestureResponderEvent, PressableStateCallbackType, StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import Icon from './Icon';
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

    /** The icon asset to display to the left of the text */
    icon?: IconAsset | null;

    /** Any additional styles to pass to the left icon container. */
    iconStyles?: StyleProp<ViewStyle>;

    /** Additional styles from OfflineWithFeedback applied to the row */
    style?: StyleProp<ViewStyle>;
};

function Badge({
    success = false,
    error = false,
    pressable = false,
    text,
    environment = CONST.ENVIRONMENT.DEV,
    badgeStyles,
    textStyles,
    onPress = () => {},
    icon,
    iconStyles = [],
    style,
}: BadgeProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const Wrapper = pressable ? PressableWithoutFeedback : View;

    const isDeleted = style && Array.isArray(style) ? style.includes(styles.offlineFeedback.deleted) : false;

    const iconColor = StyleUtils.getIconColorStyle(success, error);

    const wrapperStyles: (state: PressableStateCallbackType) => StyleProp<ViewStyle> = useCallback(
        ({pressed}) => [
            styles.defaultBadge,
            styles.alignSelfCenter,
            styles.ml2,
            StyleUtils.getBadgeColorStyle(success, error, pressed, environment === CONST.ENVIRONMENT.ADHOC),
            badgeStyles,
        ],
        [styles.defaultBadge, styles.alignSelfCenter, styles.ml2, StyleUtils, success, error, environment, badgeStyles],
    );

    return (
        <Wrapper
            style={pressable ? wrapperStyles : wrapperStyles({focused: false, hovered: false, isDisabled: false, isScreenReaderActive: false, pressed: false})}
            onPress={onPress}
            role={pressable ? CONST.ROLE.BUTTON : CONST.ROLE.PRESENTATION}
            accessibilityLabel={pressable ? text : undefined}
            aria-label={!pressable ? text : undefined}
            accessible={false}
        >
            {!!icon && (
                <View style={[styles.mr2, iconStyles]}>
                    <Icon
                        width={variables.iconSizeExtraSmall}
                        height={variables.iconSizeExtraSmall}
                        src={icon}
                        fill={iconColor}
                    />
                </View>
            )}
            <Text
                style={[styles.badgeText, styles.textStrong, textStyles, isDeleted ? styles.offlineFeedback.deleted : {}]}
                numberOfLines={1}
            >
                {text}
            </Text>
        </Wrapper>
    );
}

Badge.displayName = 'Badge';

export default Badge;
