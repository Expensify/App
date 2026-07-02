import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {Directions, Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useSharedValue, withSpring} from 'react-native-reanimated';
import type {SvgProps} from 'react-native-svg';
import {scheduleOnRN} from 'react-native-worklets';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Pressables from '@components/Pressable';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {GrowlAction, GrowlType} from '@libs/Growl';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import GrowlNotificationContainer from './GrowlNotificationContainer';

const INACTIVE_OFFSET = CONST.GROWL.OFFSCREEN_OFFSET;
const INACTIVE_POSITION_Y = -INACTIVE_OFFSET;

const PressableWithoutFeedback = Pressables.PressableWithoutFeedback;

type GrowlNotificationContentProps = {
    bodyText: string;
    type: GrowlType;
    duration: number;
    action?: GrowlAction;
    onDismissed: () => void;
};

// Every growl variant must have an icon mapping; keeping this map exhaustive over GrowlType.
type GrowlIconTypes = Record<
    GrowlType,
    {
        icon: React.FC<SvgProps> | IconAsset;
        iconColor: string;
    }
>;

function GrowlNotificationContent({bodyText, type, duration, action, onDismissed}: GrowlNotificationContentProps) {
    // Normalized: 0 = fully offscreen for the current anchor, 1 = fully visible. The container
    // multiplies this against the live `inactiveY`, so the offscreen position stays correct
    // even when the responsive layout flips after the growl is dismissed.
    const progress = useSharedValue(0);
    // Guards against double-firing the action's onPress while the slide-out animation
    // is still on screen. Reset whenever new growl content arrives.
    const isActionPressedRef = useRef(false);

    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Exclamation', 'Checkmark']);

    // Derived live so that resizing the window flips position + slide direction during display.
    const useBottomPosition = !!action && !shouldUseNarrowLayout;
    const inactiveY = useBottomPosition ? INACTIVE_OFFSET : INACTIVE_POSITION_Y;

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
    const fling = (targetProgress = 0, onSettled?: () => void) => {
        'worklet';

        progress.set(
            withSpring(targetProgress, {overshootClamping: false}, (finished) => {
                // Reanimated calls this with finished=false if the spring is interrupted
                // (e.g. new growl content slides in before this slide-out completes), so a
                // stale slide-out can't unmount a freshly-shown growl.
                if (!finished || !onSettled) {
                    return;
                }
                scheduleOnRN(onSettled);
            }),
        );
    };

    /**
     * Slide the growl off-screen; the spring's completion callback invokes onDismissed.
     */
    const triggerDismiss = () => {
        fling(0, onDismissed);
    };

    useEffect(() => {
        isActionPressedRef.current = false;

        // Snap to fully offscreen before sliding in so the slide-in direction matches the
        // current placement (from above for top, from below for bottom).
        progress.set(0);
        fling(1);

        const autoDismissTimeoutId = setTimeout(triggerDismiss, duration);
        return () => clearTimeout(autoDismissTimeoutId);
    }, [bodyText, type, action, duration, fling, progress, triggerDismiss]);

    // GestureDetector by default runs callbacks on UI thread using Reanimated. In this
    // case we want to trigger an RN's Animated animation, which needs to be done on JS thread.
    const flingGesture = Gesture.Fling()
        .direction(useBottomPosition ? Directions.DOWN : Directions.UP)
        .runOnJS(true)
        .onStart(() => {
            triggerDismiss();
        });

    return (
        <View style={styles.growlNotificationWrapper}>
            <GrowlNotificationContainer
                progress={progress}
                inactiveY={inactiveY}
                useBottomPosition={useBottomPosition}
            >
                <PressableWithoutFeedback
                    accessibilityLabel={bodyText}
                    sentryLabel="GrowlNotification-Dismiss"
                    onPress={triggerDismiss}
                >
                    <GestureDetector gesture={flingGesture}>
                        <View style={[styles.growlNotificationBox, action ? styles.growlNotificationBoxWithAction : styles.growlNotificationBoxWithoutAction]}>
                            <Icon
                                src={types[type].icon}
                                fill={types[type].iconColor}
                            />
                            <Text style={styles.growlNotificationText}>{bodyText}</Text>
                            {!!action && (
                                <Button
                                    medium
                                    text={action.label}
                                    accessibilityLabel={action.label}
                                    sentryLabel="GrowlNotification-Action"
                                    onPress={() => {
                                        if (isActionPressedRef.current) {
                                            return;
                                        }
                                        isActionPressedRef.current = true;
                                        triggerDismiss();
                                        action.onPress();
                                    }}
                                    innerStyles={styles.bgTransparent}
                                    textStyles={styles.growlNotificationActionText}
                                    shouldUseDefaultHover={false}
                                    hoverStyles={styles.growlNotificationActionHovered}
                                    isNested
                                />
                            )}
                        </View>
                    </GestureDetector>
                </PressableWithoutFeedback>
            </GrowlNotificationContainer>
        </View>
    );
}

export default GrowlNotificationContent;
