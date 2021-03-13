import React from 'react';
import {Pressable, TextInput, View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';

import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Text from '../../components/Text';
import ScreenWrapper from '../../components/ScreenWrapper';
import NameValuePair from '../../libs/actions/NameValuePair';
import {fetch} from '../../libs/actions/User';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';

const propTypes = {
    // The PaypalMe Username
    paypalMeAddress: PropTypes.string,
};

const defaultProps = {
    paypalMeAddress: '',
};

class PaymentsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            paypalMeAddress: props.paypalMeAddress,
        };
        this.setPaypalAccount = this.setPaypalAccount.bind(this);
    }

    componentDidMount() {
        fetch();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.paypalMeAddress !== this.props.paypalMeAddress) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({paypalMeAddress: this.props.paypalMeAddress});
        }
    }

    /**
     * Sets the paypalMeAddress for the current user
     */
    setPaypalAccount() {
        NameValuePair.set(CONST.NVP.PAYPAL_ME_ADDRESS, this.state.paypalMeAddress, ONYXKEYS.NVP_PAYPAL_ME_ADDRESS);
    }

    render() {
        return (
            <ScreenWrapper>
                {() => (
                    <>
                        <HeaderWithCloseButton
                            title="Payments"
                            shouldShowBackButton
                            onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                            onCloseButtonPress={() => Navigation.dismissModal()}
                        />
                        <View style={[styles.flex1, styles.w100, styles.p5]}>
                            <View style={[styles.flex1]}>
                                <Text style={[styles.textP, styles.mb4]}>
                                    Enter your username to get paid back via Paypal.
                                </Text>
                                <Text style={[styles.formLabel]} numberOfLines={1}>
                                    Paypal.me/
                                </Text>
                                <TextInput
                                    style={[styles.textInput]}
                                    value={this.state.paypalMeAddress}
                                    placeholder="Your Paypal username"
                                    onChangeText={text => this.setState({paypalMeAddress: text})}
                                />
                            </View>
                            <Pressable
                                onPress={this.setPaypalAccount}
                                style={({hovered}) => [
                                    styles.button,
                                    styles.buttonSuccess,
                                    styles.w100,
                                    styles.mt3,
                                    hovered && styles.buttonSuccessHovered,
                                ]}
                            >
                                <Text style={[styles.buttonText, styles.buttonSuccessText]}>
                                    Add Paypal Account
                                </Text>
                            </Pressable>
                        </View>
                    </>

                )}
            </ScreenWrapper>
        );
    }
}

PaymentsPage.propTypes = propTypes;
PaymentsPage.defaultProps = defaultProps;
PaymentsPage.displayName = 'PaymentsPage';

export default withOnyx({
    paypalMeAddress: {
        key: ONYXKEYS.NVP_PAYPAL_ME_ADDRESS,
    },
})(PaymentsPage);
