import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import MagicCodeInput from '../../../../../components/MagicCodeInput';
import * as ErrorUtils from '../../../../../libs/ErrorUtils';
import withLocalize, {withLocalizePropTypes} from '../../../../../components/withLocalize';
import ONYXKEYS from '../../../../../ONYXKEYS';
import compose from '../../../../../libs/compose';
import * as ValidationUtils from '../../../../../libs/ValidationUtils';
import * as Session from '../../../../../libs/actions/Session';

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Whether two-factor authentication is required */
        requiresTwoFactorAuth: PropTypes.bool,
    }),

    /** Specifies autocomplete hints for the system, so it can provide autofill */
    autoComplete: PropTypes.oneOf(['sms-otp', 'one-time-code']).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
};

class BaseValidateCodeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            formError: {},
            twoFactorAuthCode: '',
        };

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);
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
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        const requiresTwoFactorAuth = this.props.account.requiresTwoFactorAuth;

        if (requiresTwoFactorAuth && !this.state.twoFactorAuthCode.trim()) {
            this.setState({formError: {twoFactorAuthCode: 'twoFactorAuthForm.error.pleaseFillTwoFactorAuth'}});
            return;
        }

        if (requiresTwoFactorAuth && !ValidationUtils.isValidTwoFactorCode(this.state.twoFactorAuthCode)) {
            this.setState({formError: {twoFactorAuthCode: 'twoFactorAuthForm.error.incorrect2fa'}});
            return;
        }

        this.setState({
            formError: {},
        });

        Session.validateTwoFactorAuth(this.state.twoFactorAuthCode);
    }

    render() {
        return (
            <MagicCodeInput
                autoComplete={this.props.autoComplete}
                textContentType="oneTimeCode"
                label={this.props.translate('common.twoFactorCode')}
                nativeID="twoFactorAuthCode"
                name="twoFactorAuthCode"
                value={this.state.twoFactorAuthCode}
                onChangeText={text => this.onTextInput(text, 'twoFactorAuthCode')}
                onFulfill={this.validateAndSubmitForm}
                errorText={
                    this.state.formError.twoFactorAuthCode
                        ? this.props.translate(this.state.formError.twoFactorAuthCode)
                        : ErrorUtils.getLatestErrorMessage(this.props.account)
                }
            />
        );
    }
}

BaseValidateCodeForm.propTypes = propTypes;
BaseValidateCodeForm.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(BaseValidateCodeForm);
