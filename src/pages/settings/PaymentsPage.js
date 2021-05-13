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
import {getUserDetails} from '../../libs/actions/User';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';

const propTypes = {
    payPalMeUsername: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    payPalMeUsername: '',
};

class PaymentsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            payPalMeUsername: props.payPalMeUsername,
        };
        this.setPayPalMeUsername = this.setPayPalMeUsername.bind(this);
    }

    componentDidMount() {
        getUserDetails();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.payPalMeUsername !== this.props.payPalMeUsername) {
            // Suppressing because this is within a conditional, and hence we won't run into an infinite loop
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({payPalMeUsername: this.props.payPalMeUsername});
        }
    }

    /**
     * Sets the payPalMeUsername for the current user
     */
    setPayPalMeUsername() {
        NameValuePair.set(CONST.NVP.PAYPAL_ME_ADDRESS, this.state.payPalMeUsername, ONYXKEYS.NVP_PAYPAL_ME_ADDRESS);
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('common.payments')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <View style={[styles.flex1, styles.p5]}>
                    <View style={[styles.flex1]}>
                        <Text style={[styles.textP, styles.mb4]}>
                            {this.props.translate('paymentsPage.enterYourUsernameToGetPaidViaPayPal')}
                        </Text>
                        <Text style={[styles.formLabel]} numberOfLines={1}>
                            {this.props.translate('paymentsPage.payPalMe')}
                        </Text>
                        <TextInput
                            style={[styles.textInput]}
                            value={this.state.payPalMeUsername}
                            placeholder={this.props.translate('paymentsPage.yourPayPalUsername')}
                            onChangeText={text => this.setState({payPalMeUsername: text})}
                        />
                    </View>
                    <Pressable
                        onPress={this.setPayPalMeUsername}
                        style={({hovered}) => [
                            styles.button,
                            styles.buttonSuccess,
                            styles.mt3,
                            hovered && styles.buttonSuccessHovered,
                        ]}
                    >
                        <Text style={[styles.buttonText, styles.buttonSuccessText]}>
                            {this.props.translate('paymentsPage.addPayPalAccount')}
                        </Text>
                    </Pressable>
                </View>
            </ScreenWrapper>
        );
    }
}

PaymentsPage.propTypes = propTypes;
PaymentsPage.defaultProps = defaultProps;
PaymentsPage.displayName = 'PaymentsPage';

export default compose(
    withLocalize,
    withOnyx({
        payPalMeUsername: {
            key: ONYXKEYS.NVP_PAYPAL_ME_ADDRESS,
        },
    }),
)(PaymentsPage);
