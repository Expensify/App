import React, {Component} from 'react';
import {
    View, Animated,
} from 'react-native';
import {
    Directions, FlingGestureHandler, State, TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import colors from '../../styles/colors';
import Text from '../Text';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import styles from '../../styles/styles';
import GrowlNotificationContainer from './GrowlNotificationContainer';
import CONST from '../../CONST';
import * as Growl from '../../libs/Growl';

const types = {
    [CONST.GROWL.SUCCESS]: {
        icon: Expensicons.Checkmark,
        iconColor: colors.green,
    },
    [CONST.GROWL.ERROR]: {
        icon: Expensicons.Exclamation,
        iconColor: colors.red,
    },
    [CONST.GROWL.WARNING]: {
        icon: Expensicons.Exclamation,
        iconColor: colors.yellow,
    },
};

const INACTIVE_POSITION_Y = -255;

class GrowlNotification extends Component {
    constructor(props) {
        super(props);

        this.state = {
            bodyText: '',
            type: 'success',
            translateY: new Animated.Value(INACTIVE_POSITION_Y),
        };

        this.show = this.show.bind(this);
        this.fling = this.fling.bind(this);
    }

    componentDidMount() {
        Growl.setIsGrowlReady();
    }

    /**
     * Show the growl notification
     *
     * @param {String} bodyText
     * @param {String} type
     * @param {Number} duration
    */
    show(bodyText, type, duration) {
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
                    if (nativeEvent.state !== State.ACTIVE) {
                        return;
                    }

                    this.fling(INACTIVE_POSITION_Y);
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
