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
import * as ValidationUtils from '../../libs/ValidationUtils';
import withToggleVisibilityView, {toggleVisibilityViewPropTypes} from '../../components/withToggleVisibilityView';
import canFocusInputOnScreenFocus from '../../libs/canFocusInputOnScreenFocus';
import * as ErrorUtils from '../../libs/ErrorUtils';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';
import OfflineIndicator from '../../components/OfflineIndicator';
import * as User from '../../libs/actions/User';

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

    ...withLocalizePropTypes,
    ...toggleVisibilityViewPropTypes,
};

const defaultProps = {
    account: {},
    credentials: {},
};

class ValidateCodeForm extends React.Component {
    constructor(props) {
        super(props);
        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);
        this.resetValidateCode = this.resetValidateCode.bind(this);
        this.clearSignInData = this.clearSignInData.bind(this);

        this.state = {
            formError: false,
            validateCode: '',
            twoFactorAuthCode: '',
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
        if (!prevProps.account.requiresTwoFactorAuth && this.props.account.requiresTwoFactorAuth) {
            this.input2FA.focus();
        }
        if (prevState.twoFactorAuthCode !== this.state.twoFactorAuthCode && this.state.twoFactorAuthCode.length === CONST.TFA_CODE_LENGTH) {
            this.validateAndSubmitForm();
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
    resetValidateCode() {
        if (this.input2FA) {
            this.setState({twoFactorAuthCode: ''}, this.input2FA.clear);
        }
        this.setState({formError: false});
        User.resendValidateCode(this.props.credentials.login, true);
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
        if (!this.state.validateCode.trim()) {
            this.setState({formError: 'validateCodeForm.error.pleaseFillMagicCode'});
            return;
        }

        if (!ValidationUtils.isValidValidateCode(this.state.validateCode)) {
            this.setState({formError: 'validateCodeForm.error.incorrectMagicCode'});
            return;
        }

        if (this.props.account.requiresTwoFactorAuth && !this.state.twoFactorAuthCode.trim()) {
            this.setState({formError: 'validateCodeForm.error.pleaseFillTwoFactorAuth'});
            return;
        }

        this.setState({
            formError: null,
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
                            onChangeText={text => this.setState({twoFactorAuthCode: text})}
                            onSubmitEditing={this.validateAndSubmitForm}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                            blurOnSubmit={false}
                            maxLength={CONST.TFA_CODE_LENGTH}
                        />
                    </View>
                ) : (
                    <View style={[styles.mv3]}>
                        <TextInput
                            ref={el => this.inputValidateCode = el}
                            label={this.props.translate('common.magicCode')}
                            nativeID="validateCode"
                            name="validateCode"
                            value={this.state.validateCode}
                            onChangeText={text => this.setState({validateCode: text})}
                            onSubmitEditing={this.validateAndSubmitForm}
                            blurOnSubmit={false}
                        />
                        <View style={[styles.changeExpensifyLoginLinkContainer]}>
                            <TouchableOpacity
                                style={[styles.mt2]}
                                onPress={this.resetValidateCode}
                                underlayColor={themeColors.componentBG}
                            >
                                <Text style={[styles.link]}>
                                    {this.props.translate('validateCodeForm.magicCodeNotReceived')}
                                </Text>
                            </TouchableOpacity>
                        </View>
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

ValidateCodeForm.propTypes = propTypes;
ValidateCodeForm.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
        credentials: {key: ONYXKEYS.CREDENTIALS},
    }),
    withToggleVisibilityView,
    withNetwork(),
)(ValidateCodeForm);
