import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useLayoutEffect, useMemo, useRef} from 'react';
import Animated, {cancelAnimation, interpolateColor, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

import ActivityIndicator from './ActivityIndicator';
import Icon from './Icon';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

type SwitchProps = {
    /** Whether the switch is toggled to the on position */
    isOn: boolean;

    /** Callback to fire when the switch is toggled */
    onToggle: (isOn: boolean) => void;

    accessibilityLabel: string;
    disabled?: boolean;

    /** Whether the switch is mid-flight (an optimistic update is pending). Shows a spinner and blocks interaction. */
    pending?: boolean;

    /** Whether to show the lock icon even if the switch is enabled */
    showLockIcon?: boolean;

    /** Callback to fire when the switch is toggled in disabled state */
    disabledAction?: () => void | Promise<void>;

    /** Whether the switch is nested inside another pressable */
    isNested?: boolean;

    /**
     * Animate the thumb on any `isOn` change, not only when the switch itself is pressed. Use this when the switch can
     * be toggled from outside (e.g. the whole row or a keyboard shortcut) and it is NOT inside a recycled list. Leave it
     * off for list rows, where the default guard must stay to avoid switches flipping as rows recycle during scrolling.
     */
    shouldAnimateOnExternalChange?: boolean;
};

const OFFSET_X = {
    OFF: 0,
    ON: 20,
};

function Switch({isOn, onToggle, accessibilityLabel, disabled, pending = false, showLockIcon, disabledAction, isNested, shouldAnimateOnExternalChange = false}: SwitchProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const offsetX = useSharedValue(isOn ? OFFSET_X.ON : OFFSET_X.OFF);
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lock']);

    const targetOffsetX = isOn ? OFFSET_X.ON : OFFSET_X.OFF;
    const prevIsOn = useRef(isOn);
    const hasUserToggled = useRef(false);

    // Track when user toggles vs when props change due to recycling
    useLayoutEffect(() => {
        if (prevIsOn.current === isOn) {
            return;
        }
        if (hasUserToggled.current || shouldAnimateOnExternalChange) {
            // User just toggled (or the caller opted in to animate external changes) - animate to new position
            offsetX.set(withTiming(targetOffsetX, {duration: 300}));
            hasUserToggled.current = false;
        } else {
            // Props changed due to list recycling - immediately set position without animation
            // This prevents the visual glitch where switches appear to auto-toggle during scrolling
            cancelAnimation(offsetX);
            offsetX.set(targetOffsetX);
        }
        prevIsOn.current = isOn;
    }, [isOn, offsetX, targetOffsetX, shouldAnimateOnExternalChange]);

    const handleSwitchPress = () => {
        requestAnimationFrame(() => {
            // While an optimistic update is in flight, ignore presses so users can't stack serialized requests.
            if (pending) {
                return;
            }
            if (disabled) {
                disabledAction?.();
                return;
            }
            hasUserToggled.current = true;
            onToggle(!isOn);

            // If onToggle doesn't result in an isOn change (e.g., a modal is shown instead),
            // useLayoutEffect won't fire to clear hasUserToggled. Clear it in the next frame
            // to prevent stale flags from misclassifying future recycled prop changes.
            requestAnimationFrame(() => {
                hasUserToggled.current = false;
            });
        });
    };

    const animatedThumbStyle = useAnimatedStyle(() => ({
        transform: [{translateX: offsetX.get()}],
    }));

    const animatedSwitchTrackStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(offsetX.get(), [OFFSET_X.OFF, OFFSET_X.ON], [theme.icon, theme.success]),
    }));

    // Announce the locked state whenever the switch is disabled or shows the lock icon (e.g. a pressable switch that routes to an upgrade)
    const isLocked = !!disabled || !!showLockIcon;
    const enhancedAccessibilityLabel = useMemo(() => {
        if (isLocked) {
            return `${accessibilityLabel}, ${translate('common.locked')}`;
        }
        return accessibilityLabel;
    }, [accessibilityLabel, isLocked, translate]);

    return (
        <PressableWithFeedback
            disabled={pending || (!disabledAction && disabled)}
            isNested={isNested}
            // When nested in a pressable row (e.g. a menu row), the row owns keyboard focus, so the Switch must not be its
            // own tab stop — otherwise Tab/Shift+Tab desyncs the row's focused index from what's visually focused.
            focusable={!isNested}
            onPress={handleSwitchPress}
            onMouseDown={(e) => {
                if (!isNested) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();
            }}
            onLongPress={handleSwitchPress}
            role={CONST.ROLE.SWITCH}
            aria-checked={isOn}
            aria-busy={pending}
            accessibilityLabel={enhancedAccessibilityLabel}
            // disable hover dim for switch
            hoverDimmingValue={1}
            pressDimmingValue={0.8}
            sentryLabel={enhancedAccessibilityLabel}
        >
            <Animated.View style={[styles.switchTrack, animatedSwitchTrackStyle]}>
                <Animated.View style={[styles.switchThumb, animatedThumbStyle]}>
                    {pending ? (
                        <ActivityIndicator
                            size={variables.iconSizeSmall}
                            extraLoadingContext={{context: 'Switch'}}
                        />
                    ) : (
                        (!!disabled || !!showLockIcon) && (
                            <Icon
                                testID={CONST.SWITCH_LOCK_ICON_TEST_ID}
                                src={expensifyIcons.Lock}
                                fill={isOn ? theme.text : theme.icon}
                                width={styles.toggleSwitchLockIcon.width}
                                height={styles.toggleSwitchLockIcon.height}
                            />
                        )
                    )}
                </Animated.View>
            </Animated.View>
        </PressableWithFeedback>
    );
}

export default Switch;
export type {SwitchProps};
