import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Animated, View} from 'react-native';
import {Directions, FlingGestureHandler, State} from 'react-native-gesture-handler';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Pressables from '@components/Pressable';
import Text from '@components/Text';
import * as Growl from '@libs/Growl';
import useNativeDriver from '@libs/useNativeDriver';
import styles from '@styles/styles';
import themeColors from '@styles/themes/default';
import CONST from '@src/CONST';
import GrowlNotificationContainer from './GrowlNotificationContainer';

const types = {
    [CONST.GROWL.SUCCESS]: {
        icon: Expensicons.Checkmark,
        iconColor: themeColors.success,
    },
    [CONST.GROWL.ERROR]: {
        icon: Expensicons.Exclamation,
        iconColor: themeColors.danger,
    },
    [CONST.GROWL.WARNING]: {
        icon: Expensicons.Exclamation,
        iconColor: themeColors.warning,
    },
};

const INACTIVE_POSITION_Y = -255;

const PressableWithoutFeedback = Pressables.PressableWithoutFeedback;

function GrowlNotification(_, ref) {
    const translateY = useRef(new Animated.Value(INACTIVE_POSITION_Y)).current;
    const [bodyText, setBodyText] = useState('');
    const [type, setType] = useState('success');
    const [duration, setDuration] = useState();

    /**
     * Show the growl notification
     *
     * @param {String} bodyText
     * @param {String} type
     * @param {Number} duration
     */
    const show = useCallback((text, growlType, growlDuration) => {
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
            Animated.spring(translateY, {
                toValue: val,
                duration: 80,
                useNativeDriver,
            }).start();
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

    return (
        <FlingGestureHandler
            direction={Directions.UP}
            onHandlerStateChange={({nativeEvent}) => {
                if (nativeEvent.state !== State.ACTIVE) {
                    return;
                }

                fling();
            }}
        >
            <View style={styles.growlNotificationWrapper}>
                <GrowlNotificationContainer translateY={translateY}>
                    <PressableWithoutFeedback
                        accessibilityLabel={bodyText}
                        onPress={() => fling()}
                    >
                        <View style={styles.growlNotificationBox}>
                            <Icon
                                src={types[type].icon}
                                fill={types[type].iconColor}
                            />
                            <Text style={styles.growlNotificationText}>{bodyText}</Text>
                        </View>
                    </PressableWithoutFeedback>
                </GrowlNotificationContainer>
            </View>
        </FlingGestureHandler>
    );
}

GrowlNotification.displayName = 'GrowlNotification';

export default forwardRef(GrowlNotification);
