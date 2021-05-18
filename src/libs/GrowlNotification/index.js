import React, {
    forwardRef, useImperativeHandle, useRef, useState,
} from 'react';
import {
    Text, View, Animated,
} from 'react-native';
import {
    Directions, FlingGestureHandler, State, TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import colors from '../../styles/colors';
import Icon from '../../components/Icon';
import {Checkmark, Exclamation} from '../../components/Icon/Expensicons';
import styles from '../../styles/styles';
import GrowlNotificationContainer from './GrowlNotificationContainer';

const types = {
    success: {
        icon: Checkmark,
        iconColor: colors.green,
    },
    error: {
        icon: Exclamation,
        iconColor: colors.red,
    },
    warning: {
        icon: Exclamation,
        iconColor: colors.yellow,
    },
};

const defaultOptions = {
    bodyText: '',
    type: 'success',
};

const outDistance = -255;

const GrowlNotification = forwardRef((props, ref) => {
    const translateY = useRef(new Animated.Value(outDistance)).current;
    const [options, setOptions] = useState(defaultOptions);

    const fling = (val = 0) => {
        Animated.spring(translateY, {
            toValue: val,
            duration: 80,
            useNativeDriver: true,
        }).start();
    };

    useImperativeHandle(ref, () => ({
        show: (bodyText, type, duration = 2000) => {
            setOptions({bodyText, type});
            fling(0);
            setTimeout(() => {
                fling(outDistance);
            }, duration);
        },
    }));

    return (
        <FlingGestureHandler
            direction={Directions.UP}
            onHandlerStateChange={({nativeEvent}) => {
                if (nativeEvent.state === State.ACTIVE) {
                    fling(outDistance);
                }
            }}
        >
            <View style={styles.growlNotificationWrapper}>
                <GrowlNotificationContainer translateY={translateY}>
                    <TouchableWithoutFeedback onPress={() => fling(outDistance)}>
                        <View style={styles.growlNotificationBox}>
                            <Text style={styles.growlNotificationText}>
                                {options.bodyText}
                            </Text>
                            <Icon src={types[options.type].icon} fill={types[options.type].iconColor} />
                        </View>
                    </TouchableWithoutFeedback>
                </GrowlNotificationContainer>
            </View>
        </FlingGestureHandler>
    );
});

export default GrowlNotification;
