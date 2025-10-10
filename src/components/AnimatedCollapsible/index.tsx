import React, {useEffect} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Animated, {FadeIn, FadeOut, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';
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
};

function AnimatedCollapsible({isExpanded, children, header, duration = 300, style, headerStyle, contentStyle, expandButtonStyle, onPress, disabled = false}: AnimatedCollapsibleProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const contentHeight = useSharedValue(0);
    const hasExpanded = useSharedValue(isExpanded);

    useEffect(() => {
        hasExpanded.set(isExpanded);
    }, [isExpanded, hasExpanded]);

    const animatedHeight = useDerivedValue(() => {
        const target = hasExpanded.get() ? contentHeight.get() : 0;
        return withTiming(target, {duration, easing});
    }, [duration]);

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        height: animatedHeight.get(),
        overflow: 'hidden',
    }));

    return (
        <View style={style}>
            <View style={[headerStyle, styles.flexRow, styles.alignItemsCenter]}>
                <View style={[styles.flex1]}>{header}</View>
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
            </View>
            <Animated.View style={[contentAnimatedStyle, contentStyle]}>
                <View
                style={styles.stickToTop}
                    onLayout={(e) => {
                        const height = e.nativeEvent.layout.height;
                        if (height) {
                            contentHeight.set(height);
                        }
                    }}
                >
                    {isExpanded ? (
                        <Animated.View
                            exiting={FadeOut}
                            entering={FadeIn}
                        >
                            <View style={[styles.pv2, styles.ph3]}>
                                <View style={[styles.borderBottom]} />
                            </View>
                            {children}
                        </Animated.View>
                    ) : null}
                </View>
            </Animated.View>
        </View>
    );
}

AnimatedCollapsible.displayName = 'AnimatedCollapsible';

export default AnimatedCollapsible;
