import React, {useEffect, useRef} from 'react';
import type {ReactNode} from 'react';
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
    /** Whether the component is expanded */
    isExpanded: boolean;

    /** Element that is inside the collapsible area */
    children: ReactNode;

    /** Header content to display above the collapsible content */
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
    onPress: () => void;

    /** Whether to show the toggle button */
    shouldShowToggleButton?: boolean;
};

function AnimatedCollapsible({
    isExpanded,
    children,
    header,
    duration = 300,
    style,
    headerStyle,
    contentStyle,
    expandButtonStyle,
    onPress,
    disabled = false,
    shouldShowToggleButton = true,
}: AnimatedCollapsibleProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const contentHeight = useSharedValue(0);
    const isAnimating = useSharedValue(false);
    const hasExpanded = useSharedValue(false);
    const isExpandedFirstTime = useRef(false);

    useEffect(() => {
        if (!isExpanded && !isExpandedFirstTime.current) {
            return;
        }
        if (isExpandedFirstTime.current) {
            hasExpanded.set(true);
        } else {
            isExpandedFirstTime.current = true;
        }
    }, [hasExpanded, isExpanded]);

    // Animation for content height and opacity
    const derivedHeight = useDerivedValue(() => {
        const targetHeight = isExpanded ? contentHeight.get() : 0;
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
        const targetOpacity = isExpanded ? 1 : 0;
        isAnimating.set(true);
        return withTiming(targetOpacity, {
            duration,
            easing,
        });
    });

    const contentAnimatedStyle = useAnimatedStyle(() => {
        if (!isExpanded && !hasExpanded.get()) {
            return {
                height: 0,
                opacity: 0,
                overflow: 'hidden',
            };
        }

        return {
            height: !hasExpanded.get() ? undefined : derivedHeight.get(),
            opacity: derivedOpacity.get(),
            overflow: isAnimating.get() ? 'hidden' : 'visible',
        };
    });

    return (
        <View style={style}>
            <View style={[headerStyle, styles.flexRow, styles.alignItemsCenter]}>
                <View style={[styles.flex1]}>{header}</View>
                {shouldShowToggleButton && (
                    <PressableWithFeedback
                        onPress={onPress}
                        disabled={disabled}
                        style={[styles.p3, styles.justifyContentCenter, styles.alignItemsCenter, expandButtonStyle]}
                        accessibilityRole={CONST.ROLE.BUTTON}
                        accessibilityLabel={isExpanded ? 'Collapse' : 'Expand'}
                    >
                        {({hovered}) => (
                            <Icon
                                src={isExpanded ? Expensicons.UpArrow : Expensicons.DownArrow}
                                fill={hovered ? theme.textSupporting : theme.icon}
                                small
                            />
                        )}
                    </PressableWithFeedback>
                )}
            </View>
            <Animated.View style={[contentAnimatedStyle, contentStyle]}>
                <View
                    onLayout={(e) => {
                        if (!e.nativeEvent.layout.height) {
                            return;
                        }
                        if (!isExpanded) {
                            hasExpanded.set(true);
                        }
                        contentHeight.set(e.nativeEvent.layout.height);
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

export default AnimatedCollapsible;
