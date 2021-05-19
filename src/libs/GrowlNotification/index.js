import React, {Component} from 'react';
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

const INACTIVE_POSITION_Y = -255;

class GrowlNotification extends Component {
    constructor() {
        super();

        this.state = {
            bodyText: '',
            type: 'success',
            translateY: new Animated.Value(INACTIVE_POSITION_Y),
        };

        this.show = this.show.bind(this);
        this.fling = this.fling.bind(this);
    }

    /**
     * Show the growl notification
     *
     * @param {String} bodyText
     * @param {String} type
     * @param {Number} duration - 2000
    */
    show(bodyText, type, duration = 2000) {
        this.setState({
            bodyText,
            type,
        }, () => {
            this.fling(0);
            setTimeout(() => {
                this.fling(INACTIVE_POSITION_Y);
            }, duration);
        });
    }

    /**
     * Animate growl notification
     *
     * @param {Number} val
    */
    fling(val = INACTIVE_POSITION_Y) {
        Animated.spring(this.state.translateY, {
            toValue: val,
            duration: 80,
            useNativeDriver: true,
        }).start();
    }

    render() {
        return (
            <FlingGestureHandler
                direction={Directions.UP}
                onHandlerStateChange={({nativeEvent}) => {
                    if (nativeEvent.state === State.ACTIVE) {
                        this.fling(INACTIVE_POSITION_Y);
                    }
                }}
            >
                <View style={styles.growlNotificationWrapper}>
                    <GrowlNotificationContainer translateY={this.state.translateY}>
                        <TouchableWithoutFeedback onPress={this.fling}>
                            <View style={styles.growlNotificationBox}>
                                <Text style={styles.growlNotificationText}>
                                    {this.state.bodyText}
                                </Text>
                                <Icon src={types[this.state.type].icon} fill={types[this.state.type].iconColor} />
                            </View>
                        </TouchableWithoutFeedback>
                    </GrowlNotificationContainer>
                </View>
            </FlingGestureHandler>
        );
    }
}

export default GrowlNotification;
