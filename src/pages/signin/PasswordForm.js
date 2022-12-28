import React from 'react';
import {
    TouchableOpacity, View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import Text from '../../components/Text';
import themeColors from '../../styles/themes/default';
import * as Session from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import ChangeExpensifyLoginLink from './ChangeExpensifyLoginLink';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import TextInput from '../../components/TextInput';
import * as ComponentUtils from '../../libs/ComponentUtils';
import * as ValidationUtils from '../../libs/ValidationUtils';
import withToggleVisibilityView, {toggleVisibilityViewPropTypes} from '../../components/withToggleVisibilityView';
import canFocusInputOnScreenFocus from '../../libs/canFocusInputOnScreenFocus';
import * as ErrorUtils from '../../libs/ErrorUtils';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';
import OfflineIndicator from '../../components/OfflineIndicator';

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Whether or not two factor authentication is required */
        requiresTwoFactorAuth: PropTypes.bool,

        /** Whether or not a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
    }),

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
    ...toggleVisibilityViewPropTypes,
};

const defaultProps = {
    account: {},
};

class PasswordForm extends React.Component {
    constructor(props) {
        super(props);
        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.clearSignInData = this.clearSignInData.bind(this);

        this.state = {
            formError: false,
            password: '',
            twoFactorAuthCode: '',
        };
    }

    componentDidMount() {
        if (!canFocusInputOnScreenFocus() || !this.inputPassword || !this.props.isVisible) {
            return;
        }
        this.inputPassword.focus();
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevProps.isVisible && this.props.isVisible) {
            this.inputPassword.focus();
        }
        if (prevProps.isVisible && !this.props.isVisible && this.state.password) {
            this.clearPassword();
        }
        if (!prevProps.account.requiresTwoFactorAuth && this.props.account.requiresTwoFactorAuth) {
            this.input2FA.focus();
        }
        if (prevState.twoFactorAuthCode !== this.state.twoFactorAuthCode && this.state.twoFactorAuthCode.length === CONST.TFA_CODE_LENGTH) {
            this.validateAndSubmitForm();
        }
    }

    /**
     * Clear Password from the state
     */
    clearPassword() {
        this.setState({password: ''}, this.inputPassword.clear);
    }

    /**
     * Trigger the reset password flow and ensure the 2FA input field is reset to avoid it being permanently hidden
     */
    resetPassword() {
        if (this.input2FA) {
            this.setState({twoFactorAuthCode: ''}, this.input2FA.clear);
        }
        this.setState({formError: false});
        Session.resetPassword();
    }

    /**
    * Clears local and Onyx sign in states
    */
    clearSignInData() {
        this.setState({twoFactorAuthCode: '', formError: false});
        Session.clearSignInData();
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        if (!this.state.password.trim() && this.props.account.requiresTwoFactorAuth && !this.state.twoFactorAuthCode.trim()) {
            this.setState({formError: 'passwordForm.pleaseFillOutAllFields'});
            return;
        }

        if (!this.state.password.trim()) {
            this.setState({formError: 'passwordForm.pleaseFillPassword'});
            return;
        }

        if (!ValidationUtils.isValidPassword(this.state.password)) {
            this.setState({formError: 'passwordForm.error.incorrectPassword'});
            return;
        }

        if (this.props.account.requiresTwoFactorAuth) {
            const twoFactorCode = this.state.twoFactorAuthCode.trim();

            if (!twoFactorCode) {
                this.setState({formError: 'passwordForm.pleaseFillTwoFactorAuth'});
                return;
            }

            if (!ValidationUtils.isValidTwoFactorCode(twoFactorCode)) {
                this.setState({formError: 'passwordForm.error.incorrect2fa'});
                return;
            }
        }

        this.setState({
            formError: null,
        });

        Session.signIn(this.state.password, this.state.twoFactorAuthCode);
    }

    render() {
        return (
            <>
                <View style={[styles.mv3]}>
                    <TextInput
                        ref={el => this.inputPassword = el}
                        label={this.props.translate('common.password')}
                        secureTextEntry
                        autoCompleteType={ComponentUtils.PASSWORD_AUTOCOMPLETE_TYPE}
                        textContentType="password"
                        nativeID="password"
                        name="password"
                        value={this.state.password}
                        onChangeText={text => this.setState({password: text})}
                        onSubmitEditing={this.validateAndSubmitForm}
                        blurOnSubmit={false}
                    />
                    <View style={[styles.changeExpensifyLoginLinkContainer]}>
                        <TouchableOpacity
                            style={[styles.mt2]}
                            onPress={this.resetPassword}
                        >
                            <Text style={[styles.link]}>
                                {this.props.translate('passwordForm.forgot')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {this.props.account.requiresTwoFactorAuth && (
                    <View style={[styles.mv3]}>
                        <TextInput
                            ref={el => this.input2FA = el}
                            label={this.props.translate('passwordForm.twoFactorCode')}
                            value={this.state.twoFactorAuthCode}
                            placeholder={this.props.translate('passwordForm.requiredWhen2FAEnabled')}
                            placeholderTextColor={themeColors.placeholderText}
                            onChangeText={text => this.setState({twoFactorAuthCode: text})}
                            onSubmitEditing={this.validateAndSubmitForm}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                            blurOnSubmit={false}
                            maxLength={CONST.TFA_CODE_LENGTH}
                        />
                    </View>
                )}

                {!this.state.formError && this.props.account && !_.isEmpty(this.props.account.errors) && (
                    <Text style={[styles.formError]}>
                        {ErrorUtils.getLatestErrorMessage(this.props.account)}
                    </Text>
                )}

                {this.state.formError && (
                    <Text style={[styles.formError]}>
                        {this.props.translate(this.state.formError)}
                    </Text>
                )}
                <View>
                    <Button
                        isDisabled={this.props.network.isOffline}
                        success
                        style={[styles.mv3]}
                        text={this.props.translate('common.signIn')}
                        isLoading={this.props.account.isLoading}
                        onPress={this.validateAndSubmitForm}
                    />
                    <ChangeExpensifyLoginLink onPress={this.clearSignInData} />
                </View>
                <OfflineIndicator containerStyles={[styles.mv5]} />
            </>
        );
    }
}

PasswordForm.propTypes = propTypes;
PasswordForm.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
    withToggleVisibilityView,
    withNetwork(),
)(PasswordForm);
