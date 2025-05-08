import type {ForwardedRef} from 'react';
import React, {forwardRef, useEffect, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Role, Text, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Animated, {Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import Svg, {Path} from 'react-native-svg';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlatform from '@libs/getPlatform';
import useIsHomeRouteActive from '@navigation/helpers/useIsHomeRouteActive';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {PressableWithoutFeedback} from './Pressable';
import {useProductTrainingContext} from './ProductTrainingContext';
import EducationalTooltip from './Tooltip/EducationalTooltip';

const FAB_PATH = 'M12,3c0-1.1-0.9-2-2-2C8.9,1,8,1.9,8,3v5H3c-1.1,0-2,0.9-2,2c0,1.1,0.9,2,2,2h5v5c0,1.1,0.9,2,2,2c1.1,0,2-0.9,2-2v-5h5c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2h-5V3z';
const SMALL_FAB_PATH =
    'M9.6 13.6002C9.6 14.4839 8.88366 15.2002 8 15.2002C7.11635 15.2002 6.4 14.4839 6.4 13.6002V9.6002H2.4C1.51635 9.6002 0.800003 8.88385 0.800003 8.0002C0.800003 7.11654 1.51635 6.4002 2.4 6.4002H6.4V2.4002C6.4 1.51654 7.11635 0.800196 8 0.800196C8.88366 0.800196 9.6 1.51654 9.6 2.4002V6.4002H13.6C14.4837 6.4002 15.2 7.11654 15.2 8.0002C15.2 8.88385 14.4837 9.6002 13.6 9.6002H9.6V13.6002Z';

const AnimatedPath = Animated.createAnimatedComponent(Path);
AnimatedPath.displayName = 'AnimatedPath';

type FloatingActionButtonProps = {
    /* Callback to fire on request to toggle the FloatingActionButton */
    onPress: (event: GestureResponderEvent | KeyboardEvent | undefined) => void;

    /* Current state (active or not active) of the component */
    isActive: boolean;

    /* An accessibility label for the button */
    accessibilityLabel: string;

    /* An accessibility role for the button */
    role: Role;

    /* If the tooltip is allowed to be shown */
    isTooltipAllowed: boolean;
};

function FloatingActionButton({onPress, isActive, accessibilityLabel, role, isTooltipAllowed}: FloatingActionButtonProps, ref: ForwardedRef<HTMLDivElement | View | Text>) {
    const {success, buttonDefaultBG, textLight} = useTheme();
    const styles = useThemeStyles();
    const borderRadius = styles.floatingActionButton.borderRadius;
    const fabPressable = useRef<HTMLDivElement | View | Text | null>(null);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const platform = getPlatform();
    const isNarrowScreenOnWeb = shouldUseNarrowLayout && platform === CONST.PLATFORM.WEB;
    const [isSidebarLoaded] = useOnyx(ONYXKEYS.IS_SIDEBAR_LOADED, {initialValue: false, canBeMissing: true});
    const isHomeRouteActive = useIsHomeRouteActive(shouldUseNarrowLayout);
    const {renderProductTrainingTooltip, shouldShowProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GLOBAL_CREATE_TOOLTIP,
        // On Home screen, We need to wait for the sidebar to load before showing the tooltip because there is the Concierge tooltip which is higher priority
        isTooltipAllowed && (!isHomeRouteActive || isSidebarLoaded),
    );
    const isLHBVisible = !shouldUseNarrowLayout;

    const fabSize = isLHBVisible ? variables.iconSizeSmall : variables.iconSizeNormal;

    const sharedValue = useSharedValue(isActive ? 1 : 0);
    const buttonRef = ref;

    const tooltipHorizontalAnchorAlignment = isLHBVisible ? CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT : CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT;
    const tooltipShiftHorizontal = isLHBVisible ? variables.lhbFabTooltipShiftHorizontal : variables.fabTooltipShiftHorizontal;

    useEffect(() => {
        sharedValue.set(
            withTiming(isActive ? 1 : 0, {
                duration: 340,
                easing: Easing.inOut(Easing.ease),
            }),
        );
    }, [isActive, sharedValue]);

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(sharedValue.get(), [0, 1], [success, buttonDefaultBG]);

        return {
            transform: [{rotate: `${sharedValue.get() * 135}deg`}],
            backgroundColor,
        };
    });

    const toggleFabAction = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        hideProductTrainingTooltip();
        // Drop focus to avoid blue focus ring.
        fabPressable.current?.blur();
        onPress(event);
    };

    return (
        <EducationalTooltip
            shouldRender={shouldShowProductTrainingTooltip}
            anchorAlignment={{
                horizontal: isNarrowScreenOnWeb ? CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER : tooltipHorizontalAnchorAlignment,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }}
            shiftHorizontal={isNarrowScreenOnWeb ? 0 : tooltipShiftHorizontal}
            renderTooltipContent={renderProductTrainingTooltip}
            wrapperStyle={styles.productTrainingTooltipWrapper}
            shouldHideOnNavigate={false}
            onTooltipPress={toggleFabAction}
        >
            <PressableWithoutFeedback
                ref={(el) => {
                    fabPressable.current = el ?? null;
                    if (buttonRef && 'current' in buttonRef) {
                        buttonRef.current = el ?? null;
                    }
                }}
                style={[styles.h100, styles.navigationTabBarItem]}
                accessibilityLabel={accessibilityLabel}
                onPress={toggleFabAction}
                onLongPress={() => {}}
                role={role}
                shouldUseHapticsOnLongPress={false}
                testID="floating-action-button"
            >
                <Animated.View style={[styles.floatingActionButton, {borderRadius}, isLHBVisible && styles.floatingActionButtonSmall, animatedStyle]}>
                    <Svg
                        width={fabSize}
                        height={fabSize}
                    >
                        <AnimatedPath
                            d={isLHBVisible ? SMALL_FAB_PATH : FAB_PATH}
                            fill={textLight}
                        />
                    </Svg>
                </Animated.View>
            </PressableWithoutFeedback>
        </EducationalTooltip>
    );
}

FloatingActionButton.displayName = 'FloatingActionButton';

export default forwardRef(FloatingActionButton);
