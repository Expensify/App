import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import {parsePhoneNumber} from 'awesome-phonenumber';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import * as Session from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import compose from '../../libs/compose';
import canFocusInputOnScreenFocus from '../../libs/canFocusInputOnScreenFocus';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import TextInput from '../../components/TextInput';
import * as ValidationUtils from '../../libs/ValidationUtils';
import * as LoginUtils from '../../libs/LoginUtils';
import withToggleVisibilityView, {toggleVisibilityViewPropTypes} from '../../components/withToggleVisibilityView';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';
import * as ErrorUtils from '../../libs/ErrorUtils';
import DotIndicatorMessage from '../../components/DotIndicatorMessage';
import * as CloseAccount from '../../libs/actions/CloseAccount';
import CONST from '../../CONST';
import isInputAutoFilled from '../../libs/isInputAutoFilled';

const propTypes = {
    /** Should we dismiss the keyboard when transitioning away from the page? */
    blurOnSubmit: PropTypes.bool,

    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** An error message to display to the user */
        errors: PropTypes.objectOf(PropTypes.string),

        /** Success message to display when necessary */
        success: PropTypes.string,

        /** Whether or not a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
    }),

    closeAccount: PropTypes.shape({
        /** Message to display when user successfully closed their account */
        success: PropTypes.string,
    }),

    /** Props to detect online status */
    network: networkPropTypes.isRequired,

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,

    ...toggleVisibilityViewPropTypes,
};

const defaultProps = {
    account: {},
    closeAccount: {},
    blurOnSubmit: false,
};

function LoginForm({account, blurOnSubmit, closeAccount, isVisible, network, translate}) {
    const input = useRef();
    const [login, setLogin] = useState('');
    const [formError, setFormError] = useState(false);

    /**
     * Handle text input and clear formError upon text change
     *
     * @param {String} text
     */
    const onTextInput = useCallback(
        (text) => {
            setLogin(text);
            setFormError(null);

            if (account.errors || account.message) {
                Session.clearAccountMessages();
            }

            // Clear the "Account successfully closed" message when the user starts typing
            if (closeAccount.success && !isInputAutoFilled(input.current)) {
                CloseAccount.setDefaultData();
            }
        },
        [account, closeAccount, input, setFormError, setLogin],
    );

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    const validateAndSubmitForm = useCallback(() => {
        if (network.isOffline) {
            return;
        }

        // If account was closed and have success message in Onyx, we clear it here
        if (!_.isEmpty(closeAccount.success)) {
            CloseAccount.setDefaultData();
        }

        const loginTrim = login.trim();
        if (!loginTrim) {
            setFormError('common.pleaseEnterEmailOrPhoneNumber');
            return;
        }

        const phoneLogin = LoginUtils.appendCountryCode(LoginUtils.getPhoneNumberWithoutSpecialChars(loginTrim));
        const parsedPhoneNumber = parsePhoneNumber(phoneLogin);

        if (!Str.isValidEmail(loginTrim) && !parsedPhoneNumber.possible) {
            if (ValidationUtils.isNumericWithSpecialChars(loginTrim)) {
                setFormError('common.error.phoneNumber');
            } else {
                setFormError('loginForm.error.invalidFormatEmailLogin');
            }
            return;
        }

        setFormError(null);

        // Check if this login has an account associated with it or not
        Session.beginSignIn(parsedPhoneNumber.possible ? parsedPhoneNumber.number.e164 : loginTrim);
    }, [login, closeAccount, network, setFormError]);

    useEffect(() => {
        Session.clearAccountMessages();
    }, []);

    useEffect(() => {
        if (!canFocusInputOnScreenFocus() || !input.current || !isVisible) {
            return;
        }
        if (blurOnSubmit) {
            input.current.blur();
        }
        input.current.focus();
    }, [blurOnSubmit, isVisible, input]);

    const formErrorText = formError ? translate(formError) : '';
    const serverErrorText = ErrorUtils.getLatestErrorMessage(account);
    const hasError = !_.isEmpty(serverErrorText);

    return (
        <>
            <View
                accessibilityLabel={translate('loginForm.loginForm')}
                style={[styles.mt3]}
            >
                <TextInput
                    ref={input}
                    label={translate('loginForm.phoneOrEmail')}
                    value={login}
                    autoCompleteType="username"
                    textContentType="username"
                    nativeID="username"
                    name="username"
                    onChangeText={onTextInput}
                    onSubmitEditing={validateAndSubmitForm}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType={CONST.KEYBOARD_TYPE.EMAIL_ADDRESS}
                    errorText={formErrorText}
                    hasError={hasError}
                />
            </View>
            {!_.isEmpty(account.success) && <Text style={[styles.formSuccess]}>{account.success}</Text>}
            {!_.isEmpty(closeAccount.success || account.message) && (
                // DotIndicatorMessage mostly expects onyxData errors, so we need to mock an object so that the messages looks similar to prop.account.errors
                <DotIndicatorMessage
                    style={[styles.mv2]}
                    type="success"
                    messages={{0: closeAccount.success || account.message}}
                />
            )}
            {
                // We need to unmount the submit button when the component is not visible so that the Enter button
                // key handler gets unsubscribed and does not conflict with the Password Form
                isVisible && (
                    <View style={[styles.mt5]}>
                        <FormAlertWithSubmitButton
                            buttonText={translate('common.continue')}
                            isLoading={account.isLoading && account.loadingForm === CONST.FORMS.LOGIN_FORM}
                            onSubmit={validateAndSubmitForm}
                            message={serverErrorText}
                            isAlertVisible={!_.isEmpty(serverErrorText)}
                            containerStyles={[styles.mh0]}
                        />
                    </View>
                )
            }
        </>
    );
}

LoginForm.propTypes = propTypes;
LoginForm.defaultProps = defaultProps;
LoginForm.displayName = 'LoginForm';

export default compose(
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
        closeAccount: {key: ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM},
    }),
    withWindowDimensions,
    withLocalize,
    withToggleVisibilityView,
    withNetwork(),
)(LoginForm);
