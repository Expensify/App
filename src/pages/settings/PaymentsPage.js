import React from 'react';
import {Pressable, TextInput, View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';

import CONST from '../../CONST';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import Text from '../../components/Text';
import HeaderGap from '../../components/HeaderGap';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import {redirect} from '../../libs/actions/App';
import {fetch} from '../../libs/actions/User';
import NameValuePair from '../../libs/actions/NameValuePair';
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

    render() {
        return (
            <>
                <HeaderGap />
                <HeaderWithCloseButton
                    title="Payments"
                    shouldShowBackButton
                    onBackButtonPress={() => redirect(ROUTES.SETTINGS)}
                    onCloseButtonPress={() => redirect(ROUTES.HOME)}
                />
                <View style={[styles.flex1, styles.pageWrapper]}>
                    <View style={[styles.flex1, styles.settingsPageBody]}>
                        <View style={[styles.flex1]}>
                            <Text style={[styles.textLarge, styles.pv3, styles.mb4]}>
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
                        <View style={[styles.pv3]}>
                            <Pressable
                                onPress={
                                    // eslint-disable-next-line max-len
                                    () => NameValuePair.set(CONST.NVP.PAYPAL_ME_ADDRESS, this.state.paypalMeAddress, ONYXKEYS.NVP_PAYPAL_ME_ADDRESS)
                                }
                                style={({hovered}) => [
                                    styles.button,
                                    styles.buttonSuccess,
                                    styles.w100,
                                    hovered && styles.buttonSuccessHovered,
                                ]}
                            >
                                <Text style={[styles.buttonText, styles.buttonSuccessText]}>
                                    Add Paypal Account
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </>
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
