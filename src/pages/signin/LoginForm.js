import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import * as PolicyUtils from '../../libs/PolicyUtils';
import Log from '../../libs/Log';
import withNavigationFocus, {withNavigationFocusPropTypes} from '../../components/withNavigationFocus';
import usePrevious from '../../hooks/usePrevious';

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

    ...withNavigationFocusPropTypes,
};

const defaultProps = {
    account: {},
    closeAccount: {},
    blurOnSubmit: false,
};

/**
 * Enables experimental "memory only keys" mode in Onyx
 */
const setEnableMemoryOnlyKeys = () => {
    window.enableMemoryOnlyKeys();
};

function LoginForm(props) {
    const input = useRef();
    const [login, setLogin] = useState('');
    const [formError, setFormError] = useState(false);
    const prevIsVisible = usePrevious(props.isVisible);

    const {translate} = props;

    /**
     * Handle text input and clear formError upon text change
     *
     * @param {String} text
     */
    const onTextInput = useCallback(
        (text) => {
            setLogin(text);
            setFormError(null);

            if (props.account.errors || props.account.message) {
                Session.clearAccountMessages();
            }

            // Clear the "Account successfully closed" message when the user starts typing
            if (props.closeAccount.success && !isInputAutoFilled(input.current)) {
                CloseAccount.setDefaultData();
            }
        },
        [props.account, props.closeAccount, input, setFormError, setLogin],
    );

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    const validateAndSubmitForm = useCallback(() => {
        if (props.network.isOffline || props.account.isLoading) {
            return;
        }

        // If account was closed and have success message in Onyx, we clear it here
        if (!_.isEmpty(props.closeAccount.success)) {
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

        // If the user has entered a guide email, then we are going to enable an experimental Onyx mode to help with performance
        if (PolicyUtils.isExpensifyGuideTeam(loginTrim)) {
            Log.info('Detected guide email in login field, setting memory only keys.');
            setEnableMemoryOnlyKeys();
        }

        setFormError(null);

        // Check if this login has an account associated with it or not
        Session.beginSignIn(parsedPhoneNumber.possible ? parsedPhoneNumber.number.e164 : loginTrim);
    }, [login, props.account, props.closeAccount, props.network, setFormError]);

    useEffect(() => {
        // Just call clearAccountMessages on the login page (home route), because when the user is in the transition route and not yet authenticated,
        // this component will also be mounted, resetting account.isLoading will cause the app to briefly display the session expiration page.
        if (props.isFocused) {
            Session.clearAccountMessages();
        }
        if (!canFocusInputOnScreenFocus() || !input.current || !props.isVisible) {
            return;
        }
        input.current.focus();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we just want to call this function when component is mounted
    }, []);

    useEffect(() => {
        if (props.blurOnSubmit) {
            input.current.blur();
        }

        // Only focus the input if the form becomes visible again, to prevent the keyboard from automatically opening on touchscreen devices after signing out
        if (!input.current || prevIsVisible || !props.isVisible) {
            return;
        }
        input.current.focus();
    }, [props.blurOnSubmit, props.isVisible, prevIsVisible]);

    const formErrorText = useMemo(() => (formError ? translate(formError) : ''), [formError, translate]);
    const serverErrorText = useMemo(() => ErrorUtils.getLatestErrorMessage(props.account), [props.account]);
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
                    accessibilityLabel={translate('loginForm.phoneOrEmail')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
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
                    maxLength={CONST.LOGIN_CHARACTER_LIMIT}
                />
            </View>
            {!_.isEmpty(props.account.success) && <Text style={[styles.formSuccess]}>{props.account.success}</Text>}
            {!_.isEmpty(props.closeAccount.success || props.account.message) && (
                // DotIndicatorMessage mostly expects onyxData errors, so we need to mock an object so that the messages looks similar to prop.account.errors
                <DotIndicatorMessage
                    style={[styles.mv2]}
                    type="success"
                    messages={{0: props.closeAccount.success || props.account.message}}
                />
            )}
            {
                // We need to unmount the submit button when the component is not visible so that the Enter button
                // key handler gets unsubscribed
                props.isVisible && (
                    <View style={[styles.mt5]}>
                        <FormAlertWithSubmitButton
                            buttonText={translate('common.continue')}
                            isLoading={props.account.isLoading && props.account.loadingForm === CONST.FORMS.LOGIN_FORM}
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
    withNavigationFocus,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
        closeAccount: {key: ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM},
    }),
    withWindowDimensions,
    withLocalize,
    withToggleVisibilityView,
    withNetwork(),
)(LoginForm);
