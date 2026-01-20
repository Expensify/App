import type {ForwardedRef} from 'react';
import React, {useEffect, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Role, Text as TextType, View as ViewType} from 'react-native';
import {View} from 'react-native';
import Animated, {Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import Svg, {Path} from 'react-native-svg';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import Icon from './Icon';
import {PlusCircle} from './Icon/Expensicons';
import {PressableWithFeedback, PressableWithoutFeedback} from './Pressable';
import Text from './Text';
import Tooltip from './Tooltip';

const FAB_PATH = 'M12,3c0-1.1-0.9-2-2-2C8.9,1,8,1.9,8,3v5H3c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h5v5c0,1.1,0.9,2,2,2c1.1,0,2-0.9,2-2v-5h5c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2h-5V3z';
const SMALL_FAB_PATH =
    'M9.6 13.6002C9.6 14.4839 8.88366 15.2002 8 15.2002C7.11635 15.2002 6.4 14.4839 6.4 13.6002V9.6002H2.4C1.51635 9.6002 0.800003 8.88385 0.800003 8.0002C0.800003 7.11654 1.51635 6.4002 2.4 6.4002H6.4V2.4002C6.4 1.51654 7.11635 0.800196 8 0.800196C8.88366 0.800196 9.6 1.51654 9.6 2.4002V6.4002H13.6C14.4837 6.4002 15.2 7.11654 15.2 8.0002C15.2 8.88385 14.4837 9.6002 13.6 9.6002H9.6V13.6002Z';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type FloatingActionButtonProps = WithSentryLabel & {
    /* Callback to fire on request to toggle the FloatingActionButton */
    onPress: (event: GestureResponderEvent | KeyboardEvent | undefined) => void;

    /* Callback to fire on long press of the FloatingActionButton */
    onLongPress?: (event: GestureResponderEvent | KeyboardEvent | undefined) => void;

    /* Current state (active or not active) of the component */
    isActive: boolean;

    /* An accessibility label for the button */
    accessibilityLabel: string;

    /* An accessibility role for the button */
    role: Role;

    /** Reference to the outer element */
    ref?: ForwardedRef<HTMLDivElement | ViewType | TextType>;
};

function FloatingActionButton({onPress, onLongPress, isActive, accessibilityLabel, role, ref, sentryLabel}: FloatingActionButtonProps) {
    const {buttonDefaultBG, buttonHoveredBG, icon} = useTheme();
    const styles = useThemeStyles();
    const borderRadius = styles.floatingActionButton.borderRadius;
    const fabPressable = useRef<HTMLDivElement | ViewType | TextType | null>(null);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isLHBVisible = !shouldUseNarrowLayout;
    const {translate} = useLocalize();

    const fabSize = isLHBVisible ? variables.iconSizeSmall : variables.iconSizeNormal;

    const sharedValue = useSharedValue(isActive ? 1 : 0);
    const isHovered = useSharedValue(false);
    const buttonRef = ref;

    useEffect(() => {
        sharedValue.set(
            withTiming(isActive ? 1 : 0, {
                duration: 340,
                easing: Easing.inOut(Easing.ease),
            }),
        );
    }, [isActive, sharedValue]);

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = isHovered.get() && !sharedValue.get() ? buttonHoveredBG : interpolateColor(sharedValue.get(), [0, 1], [buttonDefaultBG, buttonHoveredBG]);

        return {
            transform: [{rotate: `${sharedValue.get() * 135}deg`}],
            backgroundColor,
        };
    });

    const toggleFabAction = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        // Drop focus to avoid blue focus ring.
        fabPressable.current?.blur();
        onPress(event);
    };

    const longPressFabAction = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        // Only execute on narrow layout - prevent event from firing on wide screens
        if (isLHBVisible) {
            return;
        }
        // Drop focus to avoid blue focus ring.
        fabPressable.current?.blur();
        onLongPress?.(event);
    };

    if (isLHBVisible) {
        return (
            <Tooltip text={translate('common.create')}>
                <PressableWithoutFeedback
                    ref={(el) => {
                        fabPressable.current = el ?? null;
                        if (buttonRef && 'current' in buttonRef) {
                            buttonRef.current = el ?? null;
                        }
                    }}
                    style={[
                        styles.navigationTabBarFABItem,

                        // Prevent text selection on touch devices (e.g. on long press)
                        canUseTouchScreen() && styles.userSelectNone,
                        styles.flex1,
                    ]}
                    accessibilityLabel={accessibilityLabel}
                    onPress={toggleFabAction}
                    onLongPress={longPressFabAction}
                    role={role}
                    shouldUseHapticsOnLongPress
                    testID="floating-action-button"
                    sentryLabel={sentryLabel}
                >
                    {({hovered}) => {
                        isHovered.set(hovered);

                        return (
                            <Animated.View
                                style={[styles.floatingActionButton, {borderRadius}, styles.floatingActionButtonSmall, animatedStyle]}
                                testID="fab-animated-container"
                            >
                                <Svg
                                    width={fabSize}
                                    height={fabSize}
                                >
                                    <AnimatedPath
                                        d={isLHBVisible ? SMALL_FAB_PATH : FAB_PATH}
                                        fill={icon}
                                    />
                                </Svg>
                            </Animated.View>
                        );
                    }}
                </PressableWithoutFeedback>
            </Tooltip>
        );
    }

    return (
        <PressableWithFeedback
            onPress={onPress}
            role={CONST.ROLE.BUTTON}
            accessibilityLabel={translate('common.create')}
            wrapperStyle={styles.flex1}
            style={[
                styles.navigationTabBarFABItem,

                // Prevent text selection on touch devices (e.g. on long press)
                canUseTouchScreen() && styles.userSelectNone,
                styles.flex1,
            ]}
            testID="create-action-button"
            sentryLabel={sentryLabel}
        >
            <View
                testID="fab-container"
                style={styles.navigationTabBarItem}
            >
                <View>
                    <Icon
                        src={PlusCircle}
                        fill={icon}
                        width={variables.iconBottomBar}
                        height={variables.iconBottomBar}
                    />
                </View>
                <Text
                    numberOfLines={1}
                    style={[styles.textSmall, styles.textAlignCenter, styles.mt1Half, styles.textSupporting, styles.navigationTabBarLabel]}
                >
                    {translate('common.create')}
                </Text>
            </View>
        </PressableWithFeedback>
    );
}

export default FloatingActionButton;
