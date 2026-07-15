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

import type {SvgProps} from 'react-native-svg';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {Directions, Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useSharedValue, withSpring} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import GrowlNotificationContainer from './GrowlNotificationContainer';

const INACTIVE_OFFSET = CONST.GROWL.OFFSCREEN_OFFSET;
const INACTIVE_POSITION_Y = -INACTIVE_OFFSET;

const PressableWithoutFeedback = Pressables.PressableWithoutFeedback;

type GrowlNotificationContentProps = {
    bodyText: string;
    type: GrowlType;
    duration: number;
    action?: GrowlAction;

    /** Identifies this growl instance; passed back through onDismissed so the parent can ignore stale dismissals. */
    nonce: number;
    onDismissed: (dismissedNonce: number) => void;
};

// Every growl variant must have an icon mapping; keeping this map exhaustive over GrowlType.
type GrowlIconTypes = Record<
    GrowlType,
    {
        icon: React.FC<SvgProps> | IconAsset;
        iconColor: string;
    }
>;

function GrowlNotificationContent({bodyText, type, duration, action, nonce, onDismissed}: GrowlNotificationContentProps) {
    // Normalized: 0 = fully offscreen for the current anchor, 1 = fully visible. The container
    // multiplies this against the live `inactiveY`, so the offscreen position stays correct
    // even when the responsive layout flips after the growl is dismissed.
    const progress = useSharedValue(0);
    // Guards against double-firing the action's onPress while the slide-out animation
    // is still on screen. Fresh per growl — the parent remounts this component for every show().
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
                // (e.g. a new withSpring on this shared value before the slide-out completes).
                // A replacement growl remounts with its own shared value though, so this guard
                // alone can't stop a stale slide-out from settling; the parent additionally
                // ignores dismissals whose nonce no longer matches the current growl.
                if (!finished || !onSettled) {
                    return;
                }
                scheduleOnRN(onSettled);
            }),
        );
    };

    /**
     * Slide the growl off-screen; the spring's completion callback reports this growl's
     * nonce through onDismissed so the parent can ignore it if a newer growl took over.
     */
    const triggerDismiss = () => {
        fling(0, () => onDismissed(nonce));
    };

    useEffect(() => {
        fling(1);

        const autoDismissTimeoutId = setTimeout(triggerDismiss, duration);
        return () => clearTimeout(autoDismissTimeoutId);
        // Mount-only: the parent remounts this component (key=nonce) for every new growl, so the
        // slide-in + auto-dismiss timer must arm exactly once per growl. Re-running on dep identity
        // changes (e.g. theme/layout re-renders recreating `fling`/`triggerDismiss`) would replay
        // the slide-in and reset the timer.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // GestureDetector by default runs callbacks on UI thread using Reanimated. In this
    // case we want to trigger an RN's Animated animation, which needs to be done on JS thread.
    const flingGesture = Gesture.Fling()
        .direction(useBottomPosition ? Directions.DOWN : Directions.UP)
        .runOnJS(true)
        .onStart(triggerDismiss);

    return (
        <View style={styles.growlNotificationWrapper}>
            <GrowlNotificationContainer
                progress={progress}
                inactiveY={inactiveY}
                useBottomPosition={useBottomPosition}
            >
                <GestureDetector gesture={flingGesture}>
                    <View style={[styles.growlNotificationBox, action ? styles.growlNotificationBoxWithAction : styles.growlNotificationBoxWithoutAction]}>
                        {/* The dismiss target covers only the icon + text; the action Button is a sibling
                            (not nested inside a pressable) so it stays independently focusable for screen
                            readers and its press can't bubble into a dismiss. */}
                        <PressableWithoutFeedback
                            accessibilityLabel={bodyText}
                            sentryLabel="GrowlNotification-Dismiss"
                            onPress={triggerDismiss}
                            style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}
                        >
                            <Icon
                                src={types[type].icon}
                                fill={types[type].iconColor}
                            />
                            <Text style={styles.growlNotificationText}>{bodyText}</Text>
                        </PressableWithoutFeedback>
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
                            />
                        )}
                    </View>
                </GestureDetector>
            </GrowlNotificationContainer>
        </View>
    );
}

export default GrowlNotificationContent;
