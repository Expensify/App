import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from 'react';
import {View} from 'react-native';
import {Directions, Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useSharedValue, withSpring} from 'react-native-reanimated';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Pressables from '@components/Pressable';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Growl from '@libs/Growl';
import type {GrowlRef} from '@libs/Growl';
import type IconAsset from '@src/types/utils/IconAsset';
import CONST from '@src/CONST';
import GrowlNotificationContainer from './GrowlNotificationContainer';

const INACTIVE_POSITION_Y = -255;

const PressableWithoutFeedback = Pressables.PressableWithoutFeedback;

function GrowlNotification(_: unknown, ref: ForwardedRef<GrowlRef>) {
    const translateY = useSharedValue(INACTIVE_POSITION_Y);
    const [bodyText, setBodyText] = useState('');
    const [type, setType] = useState('success');
    const [duration, setDuration] = useState<number>();
    const theme = useTheme();
    const styles = useThemeStyles();

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Exclamation'] as const);

    type GrowlIconTypes = Record<
        /** String representing the growl type, all type strings
         *  for growl notifications are stored in CONST.GROWL
         */
        string,
        {
            /** Expensicon for the page */
            icon: IconAsset;

            /** Color for the icon (should be from theme) */
            iconColor: string;
        }
    >;

    const types: GrowlIconTypes = {
        [CONST.GROWL.SUCCESS]: {
            icon: Expensicons.Checkmark,
            iconColor: theme.success,
        },
        [CONST.GROWL.ERROR]: {
            icon: expensifyIcons.Exclamation,
            iconColor: theme.danger,
        },
        [CONST.GROWL.WARNING]: {
            icon: expensifyIcons.Exclamation,
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
    const show = useCallback((text: string, growlType: string, growlDuration: number) => {
        setBodyText(text);
        setType(growlType);
        setDuration(growlDuration);
    }, []);

    /**
     * Animate growl notification
     *
     * @param {Number} val
     */
    const fling = useCallback(
        (val = INACTIVE_POSITION_Y) => {
            'worklet';

            translateY.set(
                withSpring(val, {
                    overshootClamping: false,
                }),
            );
        },
        [translateY],
    );

    useImperativeHandle(
        ref,
        () => ({
            show,
        }),
        [show],
    );

    useEffect(() => {
        Growl.setIsReady();
    }, []);

    useEffect(() => {
        if (!duration) {
            return;
        }

        fling(0);
        setTimeout(() => {
            fling();
            setDuration(undefined);
        }, duration);
    }, [duration, fling]);

    // GestureDetector by default runs callbacks on UI thread using Reanimated. In this
    // case we want to trigger an RN's Animated animation, which needs to be done on JS thread.
    const flingGesture = Gesture.Fling()
        .direction(Directions.UP)
        .runOnJS(true)
        .onStart(() => {
            fling();
        });

    return (
        <View style={[styles.growlNotificationWrapper]}>
            <GrowlNotificationContainer translateY={translateY}>
                <PressableWithoutFeedback
                    accessibilityLabel={bodyText}
                    onPress={() => fling()}
                >
                    <GestureDetector gesture={flingGesture}>
                        <View style={styles.growlNotificationBox}>
                            <Icon
                                src={types[type].icon}
                                fill={types[type].iconColor}
                            />
                            <Text style={styles.growlNotificationText}>{bodyText}</Text>
                        </View>
                    </GestureDetector>
                </PressableWithoutFeedback>
            </GrowlNotificationContainer>
        </View>
    );
}

GrowlNotification.displayName = 'GrowlNotification';

export default forwardRef(GrowlNotification);
