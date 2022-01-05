import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import ROUTES from '../../../ROUTES';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Text from '../../../components/Text';
import ScreenWrapper from '../../../components/ScreenWrapper';
import NameValuePair from '../../../libs/actions/NameValuePair';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import Button from '../../../components/Button';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView';
import FixedFooter from '../../../components/FixedFooter';
import Growl from '../../../libs/Growl';
import TextInput from '../../../components/TextInput';
import * as ValidationUtils from '../../../libs/ValidationUtils';

const propTypes = {
    /** Username for PayPal.Me */
    payPalMeUsername: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    payPalMeUsername: '',
};

class AddPayPalMePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            payPalMeUsername: props.payPalMeUsername,
            payPalMeUsernameError: false,
        };
        this.setPayPalMeUsername = this.setPayPalMeUsername.bind(this);
    }

    componentDidMount() {
        PaymentMethods.getPaymentMethods();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.payPalMeUsername === this.props.payPalMeUsername) {
            return;
        }

        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({payPalMeUsername: this.props.payPalMeUsername});
    }

    /**
     * Sets the payPalMeUsername for the current user
     */
    setPayPalMeUsername() {
        const isValid = ValidationUtils.isValidPaypalUsername(this.state.payPalMeUsername);
        if (!isValid) {
            this.setState({payPalMeUsernameError: true});
            return;
        }
        this.setState({payPalMeUsernameError: false});
        NameValuePair.set(CONST.NVP.PAYPAL_ME_ADDRESS, this.state.payPalMeUsername, ONYXKEYS.NVP_PAYPAL_ME_ADDRESS);
        Growl.show(this.props.translate('addPayPalMePage.growlMessageOnSave'), CONST.GROWL.SUCCESS, 3000);
        Navigation.navigate(ROUTES.SETTINGS_PAYMENTS);
    }

    render() {
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('common.payPalMe')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PAYMENTS)}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <View style={[styles.flex1, styles.p5]}>
                        <View style={[styles.flex1]}>
                            <Text style={[styles.mb4]}>
                                {this.props.translate('addPayPalMePage.enterYourUsernameToGetPaidViaPayPal')}
                            </Text>
                            <TextInput
                                label={this.props.translate('addPayPalMePage.payPalMe')}
                                autoCompleteType="off"
                                autoCorrect={false}
                                value={this.state.payPalMeUsername}
                                placeholder={this.props.translate('addPayPalMePage.yourPayPalUsername')}
                                onChangeText={text => this.setState({payPalMeUsername: text, payPalMeUsernameError: false})}
                                returnKeyType="done"
                                hasError={this.state.payPalMeUsernameError}
                                errorText={this.state.payPalMeUsernameError ? this.props.translate('addPayPalMePage.formatError') : ''}
                            />
                        </View>
                    </View>
                    <FixedFooter>
                        <Button
                            success
                            onPress={this.setPayPalMeUsername}
                            pressOnEnter
                            style={[styles.mt3]}
                            isDisabled={this.state.payPalMeUsername === this.props.payPalMeUsername}
                            text={this.props.payPalMeUsername
                                ? this.props.translate('addPayPalMePage.editPayPalAccount')
                                : this.props.translate('addPayPalMePage.addPayPalAccount')}
                        />
                    </FixedFooter>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

AddPayPalMePage.propTypes = propTypes;
AddPayPalMePage.defaultProps = defaultProps;
AddPayPalMePage.displayName = 'AddPayPalMePage';

export default compose(
    withLocalize,
    withOnyx({
        payPalMeUsername: {
            key: ONYXKEYS.NVP_PAYPAL_ME_ADDRESS,
        },
    }),
)(AddPayPalMePage);
