import React, {useCallback, useState} from 'react';
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
    ...withLocalizePropTypes,

    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Whether two-factor authentication is required */
        requiresTwoFactorAuth: PropTypes.bool,
    }),

    /** Specifies autocomplete hints for the system, so it can provide autofill */
    autoComplete: PropTypes.oneOf(['sms-otp', 'one-time-code']).isRequired,
};

const defaultProps = {
    account: {},
};

function BaseTwoFactorAuthForm(props) {
    const [formError, setFormError] = useState({});
    const [twoFactorAuthCode, setTwoFactorAuthCode] = useState('');

    /**
     * Handle text input and clear formError upon text change
     *
     * @param {String} text
     */
    const onTextInput = useCallback(
        (text) => {
            setTwoFactorAuthCode(text);
            setFormError({});

            if (props.account.errors) {
                Session.clearAccountMessages();
            }
        },
        [props.account.errors],
    );

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    const validateAndSubmitForm = useCallback(() => {
        if (!twoFactorAuthCode.trim()) {
            setFormError({twoFactorAuthCode: 'twoFactorAuthForm.error.pleaseFillTwoFactorAuth'});
            return;
        }

        if (!ValidationUtils.isValidTwoFactorCode(twoFactorAuthCode)) {
            setFormError({twoFactorAuthCode: 'twoFactorAuthForm.error.incorrect2fa'});
            return;
        }

        setFormError({});
        Session.validateTwoFactorAuth(twoFactorAuthCode);
    }, [twoFactorAuthCode]);

    return (
        <MagicCodeInput
            autoComplete={props.autoComplete}
            textContentType="oneTimeCode"
            label={props.translate('common.twoFactorCode')}
            nativeID="twoFactorAuthCode"
            name="twoFactorAuthCode"
            value={twoFactorAuthCode}
            onChangeText={onTextInput}
            onFulfill={validateAndSubmitForm}
            errorText={formError.twoFactorAuthCode ? props.translate(formError.twoFactorAuthCode) : ErrorUtils.getLatestErrorMessage(props.account)}
        />
    );
}

BaseTwoFactorAuthForm.propTypes = propTypes;
BaseTwoFactorAuthForm.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(BaseTwoFactorAuthForm);
