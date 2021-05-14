import React, {
    forwardRef, useImperativeHandle, useRef, useState,
} from 'react';
import {
    StyleSheet, Text, View, Animated, Platform,
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
import variables from '../styles/variables';

const desktopContainerStyle = {
    maxWidth: '380px',
    top: '20px',
    right: 0,
    position: 'fixed',
};

const popupStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        position: 'absolute',
        width: '100%',
        zIndex: 2,
        ...Platform.select({
            web: desktopContainerStyle,
            macos: desktopContainerStyle,
            windows: desktopContainerStyle,
        }),
        ...styles.ph5,
    },
    smallScreenWidth: {
        maxWidth: 'none',
    },
    box: {
        backgroundColor: colors.dark,
        borderRadius: variables.componentBorderRadiusNormal,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        shadowColor: '#000',
        ...styles.p5,
    },
    bodyText: {
        fontSize: variables.fontSizeNormal,
        ...styles.colorReversed,
    },
});

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
        iconColor: colors.orange,
    },
};

const defaultOptions = {
    bodyText: 'This is a text',
    type: 'success',
};

const outDistance = -255;

const PopUpNotification = forwardRef(({isSmallScreenWidth}, ref) => {
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
                style={[popupStyles.container, isSmallScreenWidth && popupStyles.smallScreenWidth, {
                    transform: [{translateY: slideDown}],
                }]}
            >
                <TouchableWithoutFeedback onPress={() => fling(outDistance)}>
                    <ScreenWrapper>
                        <View style={popupStyles.box}>
                            <Text style={popupStyles.bodyText}>
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

PopUpNotification.propTypes = windowDimensionsPropTypes;

export default withWindowDimensions(PopUpNotification);
