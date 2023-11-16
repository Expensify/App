import {parsePhoneNumber} from 'awesome-phonenumber';
import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import networkPropTypes from '@components/networkPropTypes';
import {withNetwork} from '@components/OnyxProvider';
import AppleSignIn from '@components/SignInButtons/AppleSignIn';
import GoogleSignIn from '@components/SignInButtons/GoogleSignIn';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withNavigationFocus from '@components/withNavigationFocus';
import withToggleVisibilityView from '@components/withToggleVisibilityView';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import usePrevious from '@hooks/usePrevious';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import compose from '@libs/compose';
import * as ErrorUtils from '@libs/ErrorUtils';
import isInputAutoFilled from '@libs/isInputAutoFilled';
import Log from '@libs/Log';
import * as LoginUtils from '@libs/LoginUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import Visibility from '@libs/Visibility';
import useThemeStyles from '@styles/useThemeStyles';
import * as CloseAccount from '@userActions/CloseAccount';
import * as MemoryOnlyKeys from '@userActions/MemoryOnlyKeys/MemoryOnlyKeys';
import * as Session from '@userActions/Session';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Should we dismiss the keyboard when transitioning away from the page? */
    blurOnSubmit: PropTypes.bool,

    /** A reference so we can expose if the form input is focused */
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

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

    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email the user logged in with */
        login: PropTypes.string,
    }),

    /** Props to detect online status */
    network: networkPropTypes.isRequired,

    /** Whether or not the sign in page is being rendered in the RHP modal */
    isInModal: PropTypes.bool,

    isVisible: PropTypes.bool.isRequired,

    /** Whether navigation is focused */
    isFocused: PropTypes.bool.isRequired,

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
    credentials: {
        login: '',
    },
    closeAccount: {},
    blurOnSubmit: false,
    innerRef: () => {},
    isInModal: false,
};

function LoginForm(props) {
    const styles = useThemeStyles();
    const input = useRef();
    const [login, setLogin] = useState(() => Str.removeSMSDomain(props.credentials.login || ''));
    const [formError, setFormError] = useState(false);
    const prevIsVisible = usePrevious(props.isVisible);
    const firstBlurred = useRef(false);

    const {translate} = props;

    /**
     * Validate the input value and set the error for formError
     *
     * @param {String} value
     */
    const validate = useCallback(
        (value) => {
            const loginTrim = value.trim();
            if (!loginTrim) {
                setFormError('common.pleaseEnterEmailOrPhoneNumber');
                return false;
            }

            const phoneLogin = LoginUtils.appendCountryCode(LoginUtils.getPhoneNumberWithoutSpecialChars(loginTrim));
            const parsedPhoneNumber = parsePhoneNumber(phoneLogin);

            if (!Str.isValidEmail(loginTrim) && !parsedPhoneNumber.possible) {
                if (ValidationUtils.isNumericWithSpecialChars(loginTrim)) {
                    setFormError('common.error.phoneNumber');
                } else {
                    setFormError('loginForm.error.invalidFormatEmailLogin');
                }
                return false;
            }

            setFormError(null);
            return true;
        },
        [setFormError],
    );

    /**
     * Handle text input and validate the text input if it is blurred
     *
     * @param {String} text
     */
    const onTextInput = useCallback(
        (text) => {
            setLogin(text);
            if (firstBlurred.current) {
                validate(text);
            }

            if (props.account.errors || props.account.message) {
                Session.clearAccountMessages();
            }

            // Clear the "Account successfully closed" message when the user starts typing
            if (props.closeAccount.success && !isInputAutoFilled(input.current)) {
                CloseAccount.setDefaultData();
            }
        },
        [props.account, props.closeAccount, input, setLogin, validate],
    );

    function getSignInWithStyles() {
        return props.isSmallScreenWidth ? [styles.mt1] : [styles.mt5, styles.mb5];
    }

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

        // For native, the single input doesn't lost focus when we click outside.
        // So we need to change firstBlurred here to make the validate function is called whenever the text input is changed after the first validation.
        if (!firstBlurred.current) {
            firstBlurred.current = true;
        }

        if (!validate(login)) {
            return;
        }

        const loginTrim = login.trim();

        // If the user has entered a guide email, then we are going to enable an experimental Onyx mode to help with performance
        if (PolicyUtils.isExpensifyGuideTeam(loginTrim)) {
            Log.info('Detected guide email in login field, setting memory only keys.');
            MemoryOnlyKeys.enable();
        }

        const phoneLogin = LoginUtils.appendCountryCode(LoginUtils.getPhoneNumberWithoutSpecialChars(loginTrim));
        const parsedPhoneNumber = parsePhoneNumber(phoneLogin);

        // Check if this login has an account associated with it or not
        Session.beginSignIn(parsedPhoneNumber.possible ? parsedPhoneNumber.number.e164 : loginTrim);
    }, [login, props.account, props.closeAccount, props.network, validate]);

    useEffect(() => {
        // Just call clearAccountMessages on the login page (home route), because when the user is in the transition route and not yet authenticated,
        // this component will also be mounted, resetting account.isLoading will cause the app to briefly display the session expiration page.
        if (props.isFocused && props.isVisible) {
            Session.clearAccountMessages();
        }
        if (!canFocusInputOnScreenFocus() || !input.current || !props.isVisible) {
            return;
        }
        let focusTimeout;
        if (props.isInModal) {
            focusTimeout = setTimeout(() => input.current.focus(), CONST.ANIMATED_TRANSITION);
        } else {
            input.current.focus();
        }
        return () => clearTimeout(focusTimeout);
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

    useImperativeHandle(props.innerRef, () => ({
        isInputFocused() {
            return input.current && input.current.isFocused();
        },
    }));

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
                    value={login}
                    returnKeyType="go"
                    autoCompleteType="username"
                    textContentType="username"
                    id="username"
                    name="username"
                    onBlur={() => {
                        if (firstBlurred.current || !Visibility.isVisible() || !Visibility.hasFocus()) {
                            return;
                        }
                        firstBlurred.current = true;
                        validate(login);
                    }}
                    onChangeText={onTextInput}
                    onSubmitEditing={validateAndSubmitForm}
                    autoCapitalize="none"
                    autoCorrect={false}
                    inputMode={CONST.INPUT_MODE.EMAIL}
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
                    <View style={[!_.isEmpty(serverErrorText) ? {} : styles.mt5]}>
                        <FormAlertWithSubmitButton
                            buttonText={translate('common.continue')}
                            isLoading={props.account.isLoading && props.account.loadingForm === CONST.FORMS.LOGIN_FORM}
                            onSubmit={validateAndSubmitForm}
                            message={serverErrorText}
                            isAlertVisible={!_.isEmpty(serverErrorText)}
                            buttonStyles={[!_.isEmpty(serverErrorText) ? styles.mt3 : {}]}
                            containerStyles={[styles.mh0]}
                        />
                        {
                            // This feature has a few behavioral differences in development mode. To prevent confusion
                            // for developers about possible regressions, we won't render buttons in development mode.
                            // For more information about these differences and how to test in development mode,
                            // see`Expensify/App/contributingGuides/APPLE_GOOGLE_SIGNIN.md`
                            CONFIG.ENVIRONMENT !== CONST.ENVIRONMENT.DEV && (
                                <View style={[getSignInWithStyles()]}>
                                    <Text
                                        accessibilityElementsHidden
                                        importantForAccessibility="no-hide-descendants"
                                        style={[styles.textLabelSupporting, styles.textAlignCenter, styles.mb3, styles.mt2]}
                                    >
                                        {props.translate('common.signInWith')}
                                    </Text>

                                    <View style={props.isSmallScreenWidth ? styles.loginButtonRowSmallScreen : styles.loginButtonRow}>
                                        <View onMouseDown={(e) => e.preventDefault()}>
                                            <AppleSignIn />
                                        </View>
                                        <View onMouseDown={(e) => e.preventDefault()}>
                                            <GoogleSignIn />
                                        </View>
                                    </View>
                                </View>
                            )
                        }
                    </View>
                )
            }
        </>
    );
}

LoginForm.propTypes = propTypes;
LoginForm.defaultProps = defaultProps;
LoginForm.displayName = 'LoginForm';

const LoginFormWithRef = forwardRef((props, ref) => (
    <LoginForm
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

LoginFormWithRef.displayName = 'LoginFormWithRef';

export default compose(
    withNavigationFocus,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
        credentials: {key: ONYXKEYS.CREDENTIALS},
        closeAccount: {key: ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM},
    }),
    withWindowDimensions,
    withLocalize,
    withToggleVisibilityView,
    withNetwork(),
)(LoginFormWithRef);
