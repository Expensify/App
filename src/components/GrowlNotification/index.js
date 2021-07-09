import React, {Component} from 'react';
import {
    Text, View, Animated,
} from 'react-native';
import {
    Directions, FlingGestureHandler, State, TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import colors from '../../styles/colors';
import Icon from '../Icon';
import {Checkmark, Exclamation} from '../Icon/Expensicons';
import styles from '../../styles/styles';
import GrowlNotificationContainer from './GrowlNotificationContainer';
import CONST from '../../CONST';
import BankAccountExistingOwners from './templates/BankAccountExistingOwners';

const types = {
    [CONST.GROWL.SUCCESS]: {
        icon: Checkmark,
        iconColor: colors.green,
    },
    [CONST.GROWL.ERROR]: {
        icon: Exclamation,
        iconColor: colors.red,
    },
    [CONST.GROWL.WARNING]: {
        icon: Exclamation,
        iconColor: colors.yellow,
    },
};

const INACTIVE_POSITION_Y = -300;

class GrowlNotification extends Component {
    constructor() {
        super();

        this.state = {
            body: '',
            type: 'success',
            translateY: new Animated.Value(INACTIVE_POSITION_Y),
            additionalProps: {},
        };

        this.show = this.show.bind(this);
        this.fling = this.fling.bind(this);
    }

    /**
     * Gets the growl template component with its template name.
     * @param {String} body
     * @return {JSX.Element|null}
     */
    getGrowlBodyComponent(body) {
        switch (body) {
            case CONST.GROWL.TEMPLATE.BANK_ACCOUNT_EXISTING_OWNERS:
                // eslint-disable-next-line react/jsx-props-no-spreading
                return <BankAccountExistingOwners {...this.state.additionalProps} />;
            default:
                return (
                    <Text style={styles.growlNotificationText}>
                        {body}
                    </Text>
                );
        }
    }

    /**
     * Show the growl notification
     *
     * @param {String} body
     * @param {String} type
     * @param {Number} duration
     * @param {Object} additionalProps
    */
    show(body, type, duration, additionalProps) {
        this.setState({
            body,
            type,
            additionalProps,
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
            duration: 100,
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
                                {this.getGrowlBodyComponent(this.state.body)}
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
