import React, {
    forwardRef, useImperativeHandle, useRef, useState,
} from 'react';
import {
    Text, View, Animated, Platform,
} from 'react-native';
import {
    Directions, FlingGestureHandler, State, TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import colors from '../styles/colors';
import Icon from '../components/Icon';
import {Checkmark, Exclamation} from '../components/Icon/Expensicons';
import ScreenWrapper from '../components/ScreenWrapper';
import styles from '../styles/styles';
import withWindowDimensions, {windowDimensionsPropTypes} from '../components/withWindowDimensions';

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

const GrowlNotification = forwardRef(({isSmallScreenWidth}, ref) => {
    const slideDown = useRef(new Animated.Value(outDistance)).current;
    const [options, setOptions] = useState(defaultOptions);

    const fling = (val = 0) => {
        Animated.spring(slideDown, {
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
            <Animated.View
                style={[
                    styles.growlNotificationContainer,
                    styles.growlNotificationTranslateY(slideDown),
                    {
                        ...Platform.select({
                            web: styles.growlNotificationDesktopContainer,
                            macos: styles.growlNotificationDesktopContainer,
                            windows: styles.growlNotificationDesktopContainer,
                        }),
                    },
                    isSmallScreenWidth && styles.mwn,
                ]}
            >
                <TouchableWithoutFeedback onPress={() => fling(outDistance)}>
                    <ScreenWrapper>
                        <View style={styles.growlNotificationBox}>
                            <Text style={styles.growlNotificationText}>
                                {options.bodyText}
                            </Text>
                            <Icon src={types[options.type].icon} fill={types[options.type].iconColor} />
                        </View>
                    </ScreenWrapper>
                </TouchableWithoutFeedback>
            </Animated.View>
        </FlingGestureHandler>
    );
});

GrowlNotification.propTypes = windowDimensionsPropTypes;

export default withWindowDimensions(GrowlNotification);
