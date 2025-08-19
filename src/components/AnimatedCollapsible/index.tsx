import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from 'react';
import type {ForwardedRef, ReactNode} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Animated, {useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {easing} from '@components/Modal/ReanimatedModal/utils';
import {PressableWithFeedback} from '@components/Pressable';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type AnimatedCollapsibleProps = {
    /** Element that is inside the collapsible area */
    children: ReactNode;

    /** Header function that receives the toggle button as a parameter */
    header: ReactNode;

    /** Duration of expansion animation */
    duration?: number;

    /** Additional external style for the container */
    style?: StyleProp<ViewStyle>;

    /** Style for the header container */
    headerStyle?: StyleProp<ViewStyle>;

    /** Style for the content container */
    contentStyle?: StyleProp<ViewStyle>;

    /** Style for the toggle button */
    expandButtonStyle?: StyleProp<ViewStyle>;

    /** Whether the toggle button is disabled */
    disabled?: boolean;

    /** Callback for when the toggle button is pressed */
    onPress?: () => void;

    /** Whether to animate on initial mount. Defaults to false */
    shouldAnimateOnMount?: boolean;

    /** Whether to force the collapsible to be expanded */
    shouldForceExpand?: boolean;
};

type AnimatedCollapsibleHandle = {
    handleToggle: () => void;
};

function AnimatedCollapsible(
    {
        children,
        header,
        duration = 300,
        style,
        headerStyle,
        contentStyle,
        expandButtonStyle,
        onPress,
        disabled = false,
        shouldAnimateOnMount = false,
        shouldForceExpand = false,
    }: AnimatedCollapsibleProps,
    ref: ForwardedRef<AnimatedCollapsibleHandle>,
) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const height = useSharedValue(0);
    const isAnimating = useSharedValue(false);
    const hasBeenToggled = useSharedValue(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Animation for content height and opacity
    const derivedHeight = useDerivedValue(() => {
        const shouldAnimate = shouldAnimateOnMount || hasBeenToggled.get();
        const targetHeight = height.get() * Number(isExpanded);

        if (!shouldAnimate) {
            return targetHeight;
        }

        return withTiming(
            targetHeight,
            {
                duration,
                easing,
            },
            (finished) => {
                if (!finished) {
                    return;
                }
                isAnimating.set(false);
            },
        );
    });

    const derivedOpacity = useDerivedValue(() => {
        const shouldAnimate = shouldAnimateOnMount || hasBeenToggled.get();
        const targetOpacity = isExpanded ? 1 : 0;

        if (!shouldAnimate) {
            return targetOpacity;
        }

        isAnimating.set(true);
        return withTiming(targetOpacity, {
            duration,
            easing,
        });
    });

    const contentAnimatedStyle = useAnimatedStyle(() => {
        if (!isExpanded && derivedHeight.get() === 0) {
            return {
                height: 0,
                opacity: 0,
                overflow: 'hidden',
            };
        }

        return {
            height: derivedHeight.get(),
            opacity: derivedOpacity.get(),
            overflow: isAnimating.get() ? 'hidden' : 'visible',
        };
    });

    const handleToggle = useCallback(() => {
        if (disabled) {
            return;
        }
        if (onPress) {
            onPress();
            return;
        }
        hasBeenToggled.set(true);
        setIsExpanded(!isExpanded);
    }, [disabled, hasBeenToggled, isExpanded, onPress]);

    useEffect(() => {
        if (!shouldForceExpand || isExpanded) {
            return;
        }
        handleToggle();
    }, [handleToggle, isExpanded, shouldForceExpand]);

    const expandButton = (
        <PressableWithFeedback
            onPress={handleToggle}
            disabled={disabled}
            style={[styles.p3, styles.justifyContentCenter, styles.alignItemsCenter, styles.pl0, expandButtonStyle]}
            accessibilityRole={CONST.ROLE.BUTTON}
            accessibilityLabel="Collapse"
        >
            {({hovered}) => (
                <Icon
                    src={isExpanded ? Expensicons.UpArrow : Expensicons.DownArrow}
                    fill={hovered ? theme.textSupporting : theme.icon}
                    small
                />
            )}
        </PressableWithFeedback>
    );

    useImperativeHandle(ref, () => ({handleToggle}));

    return (
        <View style={style}>
            <View style={[headerStyle, styles.flexRow, styles.alignItemsCenter]}>
                <View style={[styles.flex1]}>{header}</View>
                {expandButton}
            </View>
            <Animated.View style={[contentAnimatedStyle, contentStyle]}>
                <View
                    onLayout={(e) => {
                        height.set(e.nativeEvent.layout.height);
                    }}
                >
                    <View style={[styles.pv2, styles.ph3]}>
                        <View style={[styles.borderBottom]} />
                    </View>
                    {children}
                </View>
            </Animated.View>
        </View>
    );
}

AnimatedCollapsible.displayName = 'AnimatedCollapsible';

export default forwardRef(AnimatedCollapsible);
export type {AnimatedCollapsibleHandle};
