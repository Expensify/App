/* eslint-disable no-console -- temporary debug instrumentation for [growl-view] POC */
import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
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
import {setIsReady} from '@libs/Growl';
import type {GrowlAction, GrowlRef} from '@libs/Growl';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import GrowlNotificationContainer from './GrowlNotificationContainer';

const INACTIVE_OFFSET = 255;
const INACTIVE_POSITION_Y = -INACTIVE_OFFSET;

const PressableWithoutFeedback = Pressables.PressableWithoutFeedback;

type GrowlNotificationProps = {
    /** Reference to outer element */
    ref?: ForwardedRef<GrowlRef>;
};

function GrowlNotification({ref}: GrowlNotificationProps) {
    const translateY = useSharedValue(INACTIVE_POSITION_Y);
    const [bodyText, setBodyText] = useState('');
    const [type, setType] = useState('success');
    const [duration, setDuration] = useState<number>();
    const [action, setAction] = useState<GrowlAction | undefined>();
    // Guards against double-firing the action's onPress while the slide-out animation
    // is still on screen. Reset whenever a new growl is shown.
    const isActionPressedRef = useRef(false);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Exclamation', 'Checkmark']);

    // Derived live so that resizing the window flips position + slide direction during display.
    const useBottomPosition = !!action && !shouldUseNarrowLayout;
    const inactiveY = useBottomPosition ? INACTIVE_OFFSET : INACTIVE_POSITION_Y;

    type GrowlIconTypes = Record<
        /** String representing the growl type, all type strings
         *  for growl notifications are stored in CONST.GROWL
         */
        string,
        {
            /** Expensicon for the page */
            icon: React.FC<SvgProps> | IconAsset;

            /** Color for the icon (should be from theme) */
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
     * Show the growl notification
     *
     * @param {String} bodyText
     * @param {String} type
     * @param {Number} duration
     */
    const show = useCallback((text: string, growlType: string, growlDuration: number, growlAction?: GrowlAction) => {
        console.log('[growl-view] show() called', {text, growlType, growlDuration, hasAction: !!growlAction, actionLabel: growlAction?.label});
        isActionPressedRef.current = false;
        setBodyText(text);
        setType(growlType);
        setDuration(growlDuration);
        setAction(growlAction);
    }, []);

    /**
     * Animate growl notification
     *
     * @param {Number} val
     */
    const fling = useCallback(
        (val = inactiveY) => {
            'worklet';

            translateY.set(
                withSpring(val, {
                    overshootClamping: false,
                }),
            );
        },
        [translateY, inactiveY],
    );

    useImperativeHandle(
        ref,
        () => ({
            show,
        }),
        [show],
    );

    useEffect(() => {
        setIsReady();
    }, []);

    useEffect(() => {
        if (duration === undefined) {
            return;
        }

        // Snap to inactive offscreen position before sliding in, so the slide-in direction
        // matches the current placement (from above for top, from below for bottom).
        translateY.set(inactiveY);
        fling(0);

        if (duration <= 0) {
            // Indefinite (loading) growl - slide in but don't auto-dismiss.
            return;
        }

        const timeoutId = setTimeout(() => {
            fling();
            setDuration(undefined);
        }, duration);

        return () => clearTimeout(timeoutId);
    }, [duration, fling, inactiveY, translateY]);

    // GestureDetector by default runs callbacks on UI thread using Reanimated. In this
    // case we want to trigger an RN's Animated animation, which needs to be done on JS thread.
    const flingGesture = Gesture.Fling()
        .direction(useBottomPosition ? Directions.DOWN : Directions.UP)
        .runOnJS(true)
        .onStart(() => {
            fling();
        });

    console.log('[growl-view] render', {bodyText, type, duration, hasAction: !!action, useBottomPosition, shouldUseNarrowLayout});

    return (
        <View style={[styles.growlNotificationWrapper]}>
            <GrowlNotificationContainer
                translateY={translateY}
                useBottomPosition={useBottomPosition}
            >
                <PressableWithoutFeedback
                    accessibilityLabel={bodyText}
                    sentryLabel="GrowlNotification-Dismiss"
                    onPress={() => fling()}
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
                            <Text style={[styles.growlNotificationText, action ? styles.flex1 : undefined]}>{bodyText}</Text>
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
                                        console.log('[growl-view] calling fling() (slide-out animation start)');
                                        fling();
                                        console.log('[growl-view] calling action.onPress() (navigates)');
                                        action.onPress();
                                    }}
                                    style={[styles.ml2, styles.p2]}
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

export default GrowlNotification;
