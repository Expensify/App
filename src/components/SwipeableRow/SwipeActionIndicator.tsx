import Icon from '@components/Icon';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, ViewStyle} from 'react-native';
import type {AnimatedStyle, SharedValue} from 'react-native-reanimated';

import React from 'react';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';

import type {SwipeActionTint} from './types';

type SwipeActionIndicatorProps = {
    /** Icon of the action */
    icon: IconAsset;

    /** Color of the icon and its circle; neutral when not set */
    tint?: SwipeActionTint;

    /** 0 while the action is idle, 1 once releasing the swipe would run it */
    armedProgress: SharedValue<number>;

    /** Reveal animation driven by the swipe distance */
    style?: StyleProp<AnimatedStyle<ViewStyle>>;
};

/**
 * The round icon every swipe action uses: tinted (or neutral) while revealed, green once letting go would run the action.
 * Shared by swipe-to-reply in chat and list rows so all swipes look and feel the same.
 */
function SwipeActionIndicator({icon, tint, armedProgress, style}: SwipeActionIndicatorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const tintColors = tint ? theme.swipeActionTint[tint] : undefined;

    const armedStyle = useAnimatedStyle(() => ({
        opacity: armedProgress.get(),
    }));

    return (
        <Animated.View style={[styles.swipeActionIndicator, tintColors && {backgroundColor: tintColors.backgroundColor}, style]}>
            <Icon
                src={icon}
                fill={tintColors?.iconColor ?? theme.icon}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
            />
            <Animated.View style={[styles.swipeActionIndicatorArmed, armedStyle]}>
                <Icon
                    src={icon}
                    fill={theme.textLight}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                />
            </Animated.View>
        </Animated.View>
    );
}

export default SwipeActionIndicator;
