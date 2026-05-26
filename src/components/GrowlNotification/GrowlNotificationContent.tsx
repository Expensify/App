/* eslint-disable no-console -- temporary debug instrumentation for [growl-view] POC */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {Directions, Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useSharedValue, withSpring} from 'react-native-reanimated';
import type {SvgProps} from 'react-native-svg';
import ActivityIndicator from '@components/ActivityIndicator';
import Icon from '@components/Icon';
import * as Pressables from '@components/Pressable';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {GrowlAction} from '@libs/Growl';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import GrowlNotificationContainer from './GrowlNotificationContainer';

const INACTIVE_OFFSET = 255;
const INACTIVE_POSITION_Y = -INACTIVE_OFFSET;
// Approximate time for the slide spring to settle. Used to delay onDismissed
// until the slide-out animation has visibly finished.
const SLIDE_DURATION_MS = 400;

const PressableWithoutFeedback = Pressables.PressableWithoutFeedback;

type GrowlNotificationContentProps = {
    bodyText: string;
    type: string;
    duration: number;
    action?: GrowlAction;
    onDismissed: () => void;
};

function GrowlNotificationContent({bodyText, type, duration, action, onDismissed}: GrowlNotificationContentProps) {
    // Normalized: 0 = fully offscreen for the current anchor, 1 = fully visible. The container
    // multiplies this against the live `inactiveY`, so the offscreen position stays correct
    // even when the responsive layout flips after the growl is dismissed.
    const progress = useSharedValue(0);
    // Guards against double-firing the action's onPress while the slide-out animation
    // is still on screen. Reset whenever new growl content arrives.
    const isActionPressedRef = useRef(false);
    // Holds the post-fling-out setTimeout so the content-change effect can cancel a
    // pending unmount when a new growl arrives mid-dismissal. Only touched inside effects.
    const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Counter that triggers the dismiss-after-slide-out effect. Kept in state (rather than
    // a ref) so triggerDismiss doesn't transitively read a ref — that would make the React
    // Compiler reject the gesture's useMemo as "ref access during render".
    const [dismissNonce, setDismissNonce] = useState(0);

    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Exclamation', 'Checkmark']);

    // Derived live so that resizing the window flips position + slide direction during display.
    const useBottomPosition = !!action && !shouldUseNarrowLayout;
    const inactiveY = useBottomPosition ? INACTIVE_OFFSET : INACTIVE_POSITION_Y;

    type GrowlIconTypes = Record<
        string,
        {
            icon: React.FC<SvgProps> | IconAsset;
            iconColor: string;
        }
    >;

    const types: GrowlIconTypes = {
        [CONST.GROWL.SUCCESS]: {
            icon: icons.Checkmark,
            iconColor: theme.success,
        },
        [CONST.GROWL.ERROR]: {
            icon: icons.Exclamation,
            iconColor: theme.danger,
        },
        [CONST.GROWL.WARNING]: {
            icon: icons.Exclamation,
            iconColor: theme.warning,
        },
    };

    /**
     * Animate growl notification. `targetProgress` is 0 for offscreen, 1 for visible.
     */
    const fling = useCallback(
        (targetProgress = 0) => {
            'worklet';

            progress.set(
                withSpring(targetProgress, {
                    overshootClamping: false,
                }),
            );
        },
        [progress],
    );

    /**
     * Slide the growl off-screen and schedule its unmount via the dismissNonce effect.
     */
    const triggerDismiss = useCallback(() => {
        fling(0);
        setDismissNonce((n) => n + 1);
    }, [fling]);

    // Schedule unmount once a dismiss has been requested. Effect cleanup cancels the timer
    // when this effect re-runs or the component unmounts.
    useEffect(() => {
        if (dismissNonce === 0) {
            return;
        }
        const timeoutId = setTimeout(onDismissed, SLIDE_DURATION_MS);
        dismissTimeoutRef.current = timeoutId;
        return () => {
            clearTimeout(timeoutId);
            dismissTimeoutRef.current = null;
        };
    }, [dismissNonce, onDismissed]);

    useEffect(() => {
        isActionPressedRef.current = false;
        // New content arrived — cancel any in-flight unmount-after-slide-out from the previous
        // growl. (We can't reset dismissNonce here because setState in an effect body is
        // disallowed by lint; clearing the timer directly via the ref achieves the same result.)
        if (dismissTimeoutRef.current) {
            clearTimeout(dismissTimeoutRef.current);
            dismissTimeoutRef.current = null;
        }

        // Snap to fully offscreen before sliding in so the slide-in direction matches the
        // current placement (from above for top, from below for bottom).
        progress.set(0);
        fling(1);

        if (duration <= 0) {
            // Indefinite (loading) growl - slide in but don't auto-dismiss.
            return;
        }

        const autoDismissTimeoutId = setTimeout(triggerDismiss, duration);
        return () => clearTimeout(autoDismissTimeoutId);
    }, [bodyText, type, action, duration, fling, progress, triggerDismiss]);

    // GestureDetector by default runs callbacks on UI thread using Reanimated. In this
    // case we want to trigger an RN's Animated animation, which needs to be done on JS thread.
    // Wrapped in useMemo so the React Compiler doesn't flag the gesture builder's internal
    // mutable state as ref access during render.
    const flingGesture = useMemo(
        () =>
            Gesture.Fling()
                .direction(useBottomPosition ? Directions.DOWN : Directions.UP)
                .runOnJS(true)
                .onStart(() => {
                    triggerDismiss();
                }),
        [useBottomPosition, triggerDismiss],
    );

    console.log('[growl-view] INNER render', {bodyText, type, duration, hasAction: !!action, useBottomPosition, shouldUseNarrowLayout});

    return (
        <View style={[styles.growlNotificationWrapper]}>
            <GrowlNotificationContainer
                progress={progress}
                inactiveY={inactiveY}
                useBottomPosition={useBottomPosition}
            >
                <PressableWithoutFeedback
                    accessibilityLabel={bodyText}
                    sentryLabel="GrowlNotification-Dismiss"
                    onPress={() => triggerDismiss()}
                >
                    <GestureDetector gesture={flingGesture}>
                        <View style={styles.growlNotificationBox}>
                            {type === CONST.GROWL.LOADING ? (
                                <ActivityIndicator reasonAttributes={{context: 'GrowlNotification.Loading'}} />
                            ) : (
                                <Icon
                                    src={types[type].icon}
                                    fill={types[type].iconColor}
                                />
                            )}
                            <Text style={[styles.growlNotificationText, action ? styles.growlNotificationTextWithAction : styles.growlNotificationTextWithoutAction]}>{bodyText}</Text>
                            {!!action && (
                                <PressableWithoutFeedback
                                    accessibilityLabel={action.label}
                                    sentryLabel="GrowlNotification-Action"
                                    onPress={() => {
                                        if (isActionPressedRef.current) {
                                            console.log('[growl-view] action button pressed again – ignoring (already dismissing)');
                                            return;
                                        }
                                        isActionPressedRef.current = true;
                                        console.log('[growl-view] action button pressed', {actionLabel: action.label});
                                        triggerDismiss();
                                        console.log('[growl-view] calling action.onPress() (navigates)');
                                        action.onPress();
                                    }}
                                    style={[styles.mlAuto, styles.p2]}
                                >
                                    <Text style={[styles.growlNotificationText, styles.textBold, {color: theme.linkReversed}]}>{action.label}</Text>
                                </PressableWithoutFeedback>
                            )}
                        </View>
                    </GestureDetector>
                </PressableWithoutFeedback>
            </GrowlNotificationContainer>
        </View>
    );
}

export default GrowlNotificationContent;
