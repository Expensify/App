import React, {useEffect} from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Animated, {useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import Icon from '@components/Icon';
import {easing} from '@components/Modal/ReanimatedModal/utils';
import {PressableWithFeedback} from '@components/Pressable';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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

    /** Description content to display below the header */
    description?: ReactNode;

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

    /** Style for the border bottom */
    borderBottomStyle?: StyleProp<ViewStyle>;
};

function AnimatedCollapsible({
    isExpanded,
    children,
    header,
    description,
    duration = 300,
    style,
    headerStyle,
    contentStyle,
    expandButtonStyle,
    onPress,
    disabled = false,
    shouldShowToggleButton = true,
    borderBottomStyle,
}: AnimatedCollapsibleProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['UpArrow', 'DownArrow']);
    const contentHeight = useSharedValue(0);
    const descriptionHeight = useSharedValue(0);
    const hasExpanded = useSharedValue(isExpanded);
    const [isRendered, setIsRendered] = React.useState(isExpanded);
    useEffect(() => {
        hasExpanded.set(isExpanded);
        if (isExpanded) {
            setIsRendered(true);
        }
    }, [isExpanded, hasExpanded]);

    const animatedHeight = useDerivedValue(() => {
        if (!contentHeight.get()) {
            return 0;
        }

        const target = hasExpanded.get() ? contentHeight.get() : 0;

        return withTiming(target, {duration, easing}, (finished) => {
            if (!finished || target) {
                return;
            }
            scheduleOnRN(setIsRendered, false);
        });
    }, []);

    const animatedOpacity = useDerivedValue(() => {
        if (!contentHeight.get()) {
            return 0;
        }

        return withTiming(hasExpanded.get() ? 1 : 0, {duration, easing});
    });

    const descriptionOpacity = useDerivedValue(() => {
        return withTiming(!hasExpanded.get() ? 1 : 0, {duration, easing});
    });

    const descriptionAnimatedHeight = useDerivedValue(() => {
        return withTiming(!isExpanded ? descriptionHeight.get() : 0, {duration, easing});
    });

    const descriptionAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: descriptionOpacity.get(),
            // The row is collapsed by default, so we don't need to animate the height when it's not expanded
            height: isRendered ? descriptionAnimatedHeight.get() : undefined,
        };
    }, [isRendered]);

    const contentAnimatedStyle = useAnimatedStyle(() => {
        return {
            height: animatedHeight.get(),
            opacity: animatedOpacity.get(),
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
                        style={[styles.p3Half, styles.justifyContentCenter, styles.alignItemsCenter, expandButtonStyle]}
                        accessibilityRole={CONST.ROLE.BUTTON}
                        accessibilityLabel={isExpanded ? CONST.ACCESSIBILITY_LABELS.COLLAPSE : CONST.ACCESSIBILITY_LABELS.EXPAND}
                    >
                        {({hovered}) => (
                            <Icon
                                src={isExpanded ? expensifyIcons.UpArrow : expensifyIcons.DownArrow}
                                fill={theme.icon}
                                additionalStyles={!hovered && styles.opacitySemiTransparent}
                                small
                            />
                        )}
                    </PressableWithFeedback>
                )}
            </View>
            <Animated.View style={descriptionAnimatedStyle}>
                {!!description && !isExpanded && (
                    <Animated.View
                        style={isRendered && styles.stickToTop}
                        onLayout={(e) => {
                            const height = e.nativeEvent.layout.height;
                            if (height) {
                                descriptionHeight.set(height);
                            }
                        }}
                    >
                        {description}
                    </Animated.View>
                )}
            </Animated.View>
            <Animated.View style={[contentAnimatedStyle, contentStyle]}>
                {isExpanded || isRendered ? (
                    <Animated.View
                        testID={CONST.ANIMATED_COLLAPSIBLE_CONTENT_TEST_ID}
                        style={styles.stickToTop}
                        onLayout={(e) => {
                            const height = e.nativeEvent.layout.height;
                            if (height) {
                                contentHeight.set(height);
                            }
                        }}
                    >
                        <View style={[styles.pv2, styles.ph3, styles.pb1]}>
                            <View style={[styles.borderBottom, borderBottomStyle]} />
                        </View>
                        {children}
                    </Animated.View>
                ) : null}
            </Animated.View>
        </View>
    );
}

export default AnimatedCollapsible;
