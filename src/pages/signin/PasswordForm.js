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
import Form from '../../components/Form';

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
        this.validate = this.validate.bind(this);
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
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    validate(values) {
        const requiresTwoFactorAuth = this.props.account.requiresTwoFactorAuth;
        const errors = {};

        if (!values.password || !values.password.trim()) {
            errors.password = this.props.translate('passwordForm.pleaseFillPassword');
        } else if (!ValidationUtils.isValidPassword(values.password.trim())) {
            errors.password = this.props.translate('passwordForm.error.incorrectPassword');
        }

        if (requiresTwoFactorAuth && !values.twoFactorAuthCode.trim()) {
            errors.twoFactorAuthCode = this.props.translate('passwordForm.pleaseFillTwoFactorAuth');
        } else if (requiresTwoFactorAuth && !ValidationUtils.isValidTwoFactorCode(values.twoFactorAuthCode.trim())) {
            errors.twoFactorAuthCode = this.props.translate('passwordForm.error.incorrect2fa');
        }

        return errors;
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        const password = this.state.password.trim();
        const twoFactorCode = this.state.twoFactorAuthCode.trim();
        const requiresTwoFactorAuth = this.props.account.requiresTwoFactorAuth;

        if (!password && requiresTwoFactorAuth && !twoFactorCode) {
            this.setState({formError: 'passwordForm.pleaseFillOutAllFields'});
            return;
        }

        if (!password) {
            this.setState({formError: 'passwordForm.pleaseFillPassword'});
            return;
        }

        if (!ValidationUtils.isValidPassword(password)) {
            this.setState({formError: 'passwordForm.error.incorrectPassword'});
            return;
        }

        if (requiresTwoFactorAuth && !twoFactorCode) {
            this.setState({formError: 'passwordForm.pleaseFillTwoFactorAuth'});
            return;
        }

        if (requiresTwoFactorAuth && !ValidationUtils.isValidTwoFactorCode(twoFactorCode)) {
            this.setState({formError: 'passwordForm.error.incorrect2fa'});
            return;
        }

        this.setState({
            formError: null,
        });

        Session.signIn(password, twoFactorCode);
    }

    render() {
        return (
            <>
                <Form
                    formID="PasswordForm"
                    submitButtonText={this.props.translate('common.signIn')}
                    validate={this.validate}
                    onSubmit={this.validateAndSubmitForm}
                >
                    <View style={[styles.mv3]}>
                        <TextInput
                            inputID="password"
                            ref={el => this.inputPassword = el}
                            label={this.props.translate('common.password')}
                            secureTextEntry
                            autoCompleteType={ComponentUtils.PASSWORD_AUTOCOMPLETE_TYPE}
                            textContentType="password"
                            nativeID="password"
                            name="password"
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
                                inputID="twoFactorAuthCode"
                                ref={el => this.input2FA = el}
                                label={this.props.translate('passwordForm.twoFactorCode')}
                                placeholder={this.props.translate('passwordForm.requiredWhen2FAEnabled')}
                                placeholderTextColor={themeColors.placeholderText}
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
                </Form>
                <ChangeExpensifyLoginLink onPress={this.clearSignInData} />
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
