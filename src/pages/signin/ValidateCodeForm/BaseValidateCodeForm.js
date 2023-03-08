import React from 'react';
import {
    TouchableOpacity, View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import styles from '../../../styles/styles';
import Button from '../../../components/Button';
import Text from '../../../components/Text';
import themeColors from '../../../styles/themes/default';
import * as Session from '../../../libs/actions/Session';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import ChangeExpensifyLoginLink from '../ChangeExpensifyLoginLink';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import TextInput from '../../../components/TextInput';
import * as ValidationUtils from '../../../libs/ValidationUtils';
import withToggleVisibilityView, {toggleVisibilityViewPropTypes} from '../../../components/withToggleVisibilityView';
import canFocusInputOnScreenFocus from '../../../libs/canFocusInputOnScreenFocus';
import * as ErrorUtils from '../../../libs/ErrorUtils';
import {withNetwork} from '../../../components/OnyxProvider';
import networkPropTypes from '../../../components/networkPropTypes';
import * as User from '../../../libs/actions/User';
import FormHelpMessage from '../../../components/FormHelpMessage';
import Terms from '../Terms';

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Whether or not two factor authentication is required */
        requiresTwoFactorAuth: PropTypes.bool,

        /** Whether or not a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
    }),

    /** The credentials of the person signing in */
    credentials: PropTypes.shape({
        /** The login of the person signing in */
        login: PropTypes.string,
    }),

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** Specifies autocomplete hints for the system, so it can provide autofill */
    autoComplete: PropTypes.oneOf(['sms-otp', 'one-time-code']).isRequired,

    ...withLocalizePropTypes,
    ...toggleVisibilityViewPropTypes,
};

const defaultProps = {
    account: {},
    credentials: {},
};

class BaseValidateCodeForm extends React.Component {
    constructor(props) {
        super(props);
        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);
        this.resendValidateCode = this.resendValidateCode.bind(this);
        this.clearSignInData = this.clearSignInData.bind(this);

        this.state = {
            formError: {},
            validateCode: props.credentials.validateCode || '',
            twoFactorAuthCode: '',
            linkSent: false,
        };
    }

    componentDidMount() {
        if (!canFocusInputOnScreenFocus() || !this.inputValidateCode || !this.props.isVisible) {
            return;
        }
        this.inputValidateCode.focus();
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevProps.isVisible && this.props.isVisible) {
            this.inputValidateCode.focus();
        }
        if (prevProps.isVisible && !this.props.isVisible && this.state.validateCode) {
            this.clearValidateCode();
        }
        if (!prevProps.credentials.validateCode && this.props.credentials.validateCode) {
            this.setState({validateCode: this.props.credentials.validateCode});
        }
        if (!prevProps.account.requiresTwoFactorAuth && this.props.account.requiresTwoFactorAuth) {
            this.input2FA.focus();
        }
        if (prevState.twoFactorAuthCode !== this.state.twoFactorAuthCode && this.state.twoFactorAuthCode.length === CONST.TFA_CODE_LENGTH) {
            this.validateAndSubmitForm();
        }
    }

    /**
     * Handle text input and clear formError upon text change
     *
     * @param {String} text
     * @param {String} key
     */
    onTextInput(text, key) {
        this.setState({
            [key]: text,
            formError: {[key]: ''},
        });

        if (this.props.account.errors) {
            Session.clearAccountMessages();
        }
    }

    /**
     * Clear Validate Code from the state
     */
    clearValidateCode() {
        this.setState({validateCode: ''}, this.inputValidateCode.clear);
    }

    /**
     * Trigger the reset validate code flow and ensure the 2FA input field is reset to avoid it being permanently hidden
     */
    resendValidateCode() {
        if (this.input2FA) {
            this.setState({twoFactorAuthCode: ''}, this.input2FA.clear);
        }
        this.setState({formError: {}});
        User.resendValidateCode(this.props.credentials.login, true);

        // Give feedback to the user to let them know the email was sent so they don't spam the button.
        this.setState({linkSent: true});
    }

    /**
    * Clears local and Onyx sign in states
    */
    clearSignInData() {
        this.setState({twoFactorAuthCode: '', formError: {}});
        Session.clearSignInData();
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        const requiresTwoFactorAuth = this.props.account.requiresTwoFactorAuth;

        if (!this.state.validateCode.trim()) {
            this.setState({formError: {validateCode: 'validateCodeForm.error.pleaseFillMagicCode'}});
            return;
        }

        if (!ValidationUtils.isValidValidateCode(this.state.validateCode)) {
            this.setState({formError: {validateCode: 'validateCodeForm.error.incorrectMagicCode'}});
            return;
        }

        if (requiresTwoFactorAuth && !this.state.twoFactorAuthCode.trim()) {
            this.setState({formError: {twoFactorAuthCode: 'validateCodeForm.error.pleaseFillTwoFactorAuth'}});
            return;
        }

        if (requiresTwoFactorAuth && !ValidationUtils.isValidTwoFactorCode(this.state.twoFactorAuthCode)) {
            this.setState({formError: {twoFactorAuthCode: 'passwordForm.error.incorrect2fa'}});
            return;
        }

        this.setState({
            formError: {},
        });

        Session.signIn('', this.state.validateCode, this.state.twoFactorAuthCode);
    }

    render() {
        return (
            <>
                {/* At this point, if we know the account requires 2FA we already successfully authenticated */}
                {this.props.account.requiresTwoFactorAuth ? (
                    <View style={[styles.mv3]}>
                        <TextInput
                            ref={el => this.input2FA = el}
                            label={this.props.translate('validateCodeForm.twoFactorCode')}
                            value={this.state.twoFactorAuthCode}
                            placeholder={this.props.translate('validateCodeForm.requiredWhen2FAEnabled')}
                            placeholderTextColor={themeColors.placeholderText}
                            onChangeText={text => this.onTextInput(text, 'twoFactorAuthCode')}
                            onSubmitEditing={this.validateAndSubmitForm}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                            blurOnSubmit={false}
                            maxLength={CONST.TFA_CODE_LENGTH}
                            errorText={this.state.formError.twoFactorAuthCode ? this.props.translate(this.state.formError.twoFactorAuthCode) : ''}
                        />
                    </View>
                ) : (
                    <View style={[styles.mv3]}>
                        <TextInput
                            autoComplete={this.props.autoComplete}
                            textContentType="oneTimeCode"
                            ref={el => this.inputValidateCode = el}
                            label={this.props.translate('common.magicCode')}
                            nativeID="validateCode"
                            name="validateCode"
                            value={this.state.validateCode}
                            onChangeText={text => this.onTextInput(text, 'validateCode')}
                            onSubmitEditing={this.validateAndSubmitForm}
                            blurOnSubmit={false}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                            errorText={this.state.formError.validateCode ? this.props.translate(this.state.formError.validateCode) : ''}
                            autoFocus
                        />
                        <View style={[styles.changeExpensifyLoginLinkContainer]}>
                            {this.state.linkSent ? (
                                <Text style={[styles.mt2]}>
                                    {this.props.account.message}
                                </Text>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.mt2]}
                                    onPress={this.resendValidateCode}
                                    underlayColor={themeColors.componentBG}
                                >
                                    <Text style={[styles.link]}>
                                        {this.props.translate('validateCodeForm.magicCodeNotReceived')}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {this.props.account && !_.isEmpty(this.props.account.errors) && (
                    <FormHelpMessage message={ErrorUtils.getLatestErrorMessage(this.props.account)} />
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
                <View style={[styles.mt5, styles.signInPageWelcomeTextContainer]}>
                    <Terms />
                </View>
            </>
        );
    }
}

BaseValidateCodeForm.propTypes = propTypes;
BaseValidateCodeForm.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
        credentials: {key: ONYXKEYS.CREDENTIALS},
    }),
    withToggleVisibilityView,
    withNetwork(),
)(BaseValidateCodeForm);
