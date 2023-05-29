import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
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
import * as ValidationUtils from '../../../libs/ValidationUtils';
import withToggleVisibilityView, {toggleVisibilityViewPropTypes} from '../../../components/withToggleVisibilityView';
import canFocusInputOnScreenFocus from '../../../libs/canFocusInputOnScreenFocus';
import * as ErrorUtils from '../../../libs/ErrorUtils';
import {withNetwork} from '../../../components/OnyxProvider';
import networkPropTypes from '../../../components/networkPropTypes';
import * as User from '../../../libs/actions/User';
import FormHelpMessage from '../../../components/FormHelpMessage';
import MagicCodeInput from '../../../components/MagicCodeInput';
import Terms from '../Terms';
import PressableWithFeedback from '../../../components/Pressable/PressableWithFeedback';

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

    /** Indicates which locale the user currently has selected */
    preferredLocale: PropTypes.string,

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
    preferredLocale: CONST.LOCALES.DEFAULT,
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

    componentDidUpdate(prevProps) {
        if (!prevProps.isVisible && this.props.isVisible) {
            this.inputValidateCode.focus();
        }
        if (prevProps.isVisible && !this.props.isVisible && this.state.validateCode) {
            this.clearValidateCode();
        }

        // Clear the code input if a new magic code was requested
        if (this.props.isVisible && this.state.linkSent && this.props.account.message && this.state.validateCode) {
            this.clearValidateCode();
        }
        if (!prevProps.credentials.validateCode && this.props.credentials.validateCode) {
            this.setState({validateCode: this.props.credentials.validateCode});
        }
        if (!prevProps.account.requiresTwoFactorAuth && this.props.account.requiresTwoFactorAuth) {
            this.input2FA.focus();
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
            linkSent: false,
        });

        if (this.props.account.errors) {
            Session.clearAccountMessages();
        }
    }

    /**
     * Clear Validate Code from the state
     */
    clearValidateCode() {
        this.setState({validateCode: ''}, () => this.inputValidateCode.clear());
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

        if (requiresTwoFactorAuth) {
            if (!this.state.twoFactorAuthCode.trim()) {
                this.setState({formError: {twoFactorAuthCode: 'validateCodeForm.error.pleaseFillTwoFactorAuth'}});
                return;
            }

            if (!ValidationUtils.isValidTwoFactorCode(this.state.twoFactorAuthCode)) {
                this.setState({formError: {twoFactorAuthCode: 'passwordForm.error.incorrect2fa'}});
                return;
            }
        } else {
            if (!this.state.validateCode.trim()) {
                this.setState({formError: {validateCode: 'validateCodeForm.error.pleaseFillMagicCode'}});
                return;
            }
            if (!ValidationUtils.isValidValidateCode(this.state.validateCode)) {
                this.setState({formError: {validateCode: 'validateCodeForm.error.incorrectMagicCode'}});
                return;
            }
        }

        this.setState({
            formError: {},
        });

        const accountID = lodashGet(this.props, 'credentials.accountID');
        if (accountID) {
            Session.signInWithValidateCode(accountID, this.state.validateCode, this.state.twoFactorAuthCode, this.props.preferredLocale);
        } else {
            Session.signIn('', this.state.validateCode, this.state.twoFactorAuthCode, this.props.preferredLocale);
        }
    }

    render() {
        const hasError = Boolean(this.props.account) && !_.isEmpty(this.props.account.errors);
        return (
            <>
                {/* At this point, if we know the account requires 2FA we already successfully authenticated */}
                {this.props.account.requiresTwoFactorAuth ? (
                    <View style={[styles.mv3]}>
                        <MagicCodeInput
                            autoComplete={this.props.autoComplete}
                            ref={(el) => (this.input2FA = el)}
                            label={this.props.translate('common.twoFactorCode')}
                            name="twoFactorAuthCode"
                            value={this.state.twoFactorAuthCode}
                            onChangeText={(text) => this.onTextInput(text, 'twoFactorAuthCode')}
                            onFulfill={this.validateAndSubmitForm}
                            maxLength={CONST.TFA_CODE_LENGTH}
                            errorText={this.state.formError.twoFactorAuthCode ? this.props.translate(this.state.formError.twoFactorAuthCode) : ''}
                            hasError={hasError}
                            autoFocus
                        />
                    </View>
                ) : (
                    <View style={[styles.mv3]}>
                        <MagicCodeInput
                            autoComplete={this.props.autoComplete}
                            ref={(el) => (this.inputValidateCode = el)}
                            label={this.props.translate('common.magicCode')}
                            name="validateCode"
                            value={this.state.validateCode}
                            onChangeText={(text) => this.onTextInput(text, 'validateCode')}
                            onFulfill={this.validateAndSubmitForm}
                            errorText={this.state.formError.validateCode ? this.props.translate(this.state.formError.validateCode) : ''}
                            hasError={hasError}
                            autoFocus
                        />
                        <View style={[styles.changeExpensifyLoginLinkContainer]}>
                            {this.state.linkSent ? (
                                <Text style={[styles.mt2]}>{this.props.account.message ? this.props.translate(this.props.account.message) : ''}</Text>
                            ) : (
                                <PressableWithFeedback
                                    style={[styles.mt2]}
                                    onPress={this.resendValidateCode}
                                    underlayColor={themeColors.componentBG}
                                    hoverDimmingValue={1}
                                    pressDimmingValue={0.2}
                                    accessibilityRole="button"
                                    accessibilityLabel={this.props.translate('validateCodeForm.magicCodeNotReceived')}
                                >
                                    <Text style={[styles.link]}>{this.props.translate('validateCodeForm.magicCodeNotReceived')}</Text>
                                </PressableWithFeedback>
                            )}
                        </View>
                    </View>
                )}

                {hasError && <FormHelpMessage message={ErrorUtils.getLatestErrorMessage(this.props.account)} />}
                <View>
                    <Button
                        isDisabled={this.props.network.isOffline}
                        success
                        style={[styles.mv3]}
                        text={this.props.translate('common.signIn')}
                        isLoading={
                            this.props.account.isLoading &&
                            this.props.account.loadingForm === (this.props.account.requiresTwoFactorAuth ? CONST.FORMS.VALIDATE_TFA_CODE_FORM : CONST.FORMS.VALIDATE_CODE_FORM)
                        }
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
        preferredLocale: {key: ONYXKEYS.NVP_PREFERRED_LOCALE},
    }),
    withToggleVisibilityView,
    withNetwork(),
)(BaseValidateCodeForm);
