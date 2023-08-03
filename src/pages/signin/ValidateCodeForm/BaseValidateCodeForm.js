import React, {useState, useEffect, useRef, useCallback} from 'react';
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
import canFocusInputOnScreenFocus from '../../../libs/canFocusInputOnScreenFocus';
import * as ErrorUtils from '../../../libs/ErrorUtils';
import {withNetwork} from '../../../components/OnyxProvider';
import networkPropTypes from '../../../components/networkPropTypes';
import * as User from '../../../libs/actions/User';
import FormHelpMessage from '../../../components/FormHelpMessage';
import MagicCodeInput from '../../../components/MagicCodeInput';
import Terms from '../Terms';
import PressableWithFeedback from '../../../components/Pressable/PressableWithFeedback';
import usePrevious from '../../../hooks/usePrevious';
import * as StyleUtils from '../../../styles/StyleUtils';

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Whether or not two-factor authentication is required */
        requiresTwoFactorAuth: PropTypes.bool,

        /** Whether or not a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
    }),

    /** The credentials of the person signing in */
    credentials: PropTypes.shape({
        /** The login of the person signing in */
        login: PropTypes.string,
    }),

    /** Session of currently logged in user */
    session: PropTypes.shape({
        /** Currently logged in user authToken */
        authToken: PropTypes.string,
    }),

    /** Indicates which locale the user currently has selected */
    preferredLocale: PropTypes.string,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** Specifies autocomplete hints for the system, so it can provide autofill */
    autoComplete: PropTypes.oneOf(['sms-otp', 'one-time-code']).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
    credentials: {},
    session: {
        authToken: null,
    },
    preferredLocale: CONST.LOCALES.DEFAULT,
};

function BaseValidateCodeForm(props) {
    const [formError, setFormError] = useState({});
    const [validateCode, setValidateCode] = useState(props.credentials.validateCode || '');
    const [twoFactorAuthCode, setTwoFactorAuthCode] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(30);

    const prevRequiresTwoFactorAuth = usePrevious(props.account.requiresTwoFactorAuth);
    const prevValidateCode = usePrevious(props.credentials.validateCode);

    const inputValidateCodeRef = useRef();
    const input2FARef = useRef();
    const timerRef = useRef();

    const hasError = Boolean(props.account) && !_.isEmpty(props.account.errors);
    const isLoadingResendValidationForm = props.account.loadingForm === CONST.FORMS.RESEND_VALIDATE_CODE_FORM;

    useEffect(() => {
        if (!(inputValidateCodeRef.current && hasError && (props.session.autoAuthState === CONST.AUTO_AUTH_STATE.FAILED || props.account.isLoading))) {
            return;
        }
        inputValidateCodeRef.current.blur();
    }, [props.account.isLoading, props.session.autoAuthState, hasError]);

    useEffect(() => {
        if (!inputValidateCodeRef.current || !canFocusInputOnScreenFocus()) {
            return;
        }
        inputValidateCodeRef.current.focus();
    }, []);

    useEffect(() => {
        if (prevValidateCode || !props.credentials.validateCode) {
            return;
        }
        setValidateCode(props.credentials.validateCode);
    }, [props.credentials.validateCode, prevValidateCode]);

    useEffect(() => {
        if (!input2FARef.current || prevRequiresTwoFactorAuth || !props.account.requiresTwoFactorAuth) {
            return;
        }
        input2FARef.current.focus();
    }, [props.account.requiresTwoFactorAuth, prevRequiresTwoFactorAuth]);

    useEffect(() => {
        if (!inputValidateCodeRef.current || validateCode.length > 0) {
            return;
        }
        inputValidateCodeRef.current.clear();
    }, [validateCode]);

    useEffect(() => {
        if (!input2FARef.current || twoFactorAuthCode.length > 0) {
            return;
        }
        input2FARef.current.clear();
    }, [twoFactorAuthCode]);

    useEffect(() => {
        if (timeRemaining > 0) {
            timerRef.current = setTimeout(() => {
                setTimeRemaining(timeRemaining - 1);
            }, 1000);
        }
        return () => {
            clearTimeout(timerRef.current);
        };
    }, [timeRemaining]);

    /**
     * Handle text input and clear formError upon text change
     *
     * @param {String} text
     * @param {String} key
     */
    const onTextInput = (text, key) => {
        const setInput = key === 'validateCode' ? setValidateCode : setTwoFactorAuthCode;
        setInput(text);
        setFormError((prevError) => ({...prevError, [key]: ''}));

        if (props.account.errors) {
            Session.clearAccountMessages();
        }
    };

    /**
     * Trigger the reset validate code flow and ensure the 2FA input field is reset to avoid it being permanently hidden
     */
    const resendValidateCode = () => {
        User.resendValidateCode(props.credentials.login);
        // Give feedback to the user to let them know the email was sent so that they don't spam the button.
        setTimeRemaining(30);
    };

    /**
     * Clear local sign in states
     */
    const clearLocalSignInData = () => {
        setTwoFactorAuthCode('');
        setFormError({});
        setValidateCode('');
    };

    /**
     * Clears local and Onyx sign in states
     */
    const clearSignInData = () => {
        clearLocalSignInData();
        Session.clearSignInData();
    };

    useEffect(() => {
        if (!isLoadingResendValidationForm) {
            return;
        }
        clearLocalSignInData();
    }, [isLoadingResendValidationForm]);

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    const validateAndSubmitForm = useCallback(() => {
        const requiresTwoFactorAuth = props.account.requiresTwoFactorAuth;
        if (requiresTwoFactorAuth) {
            if (input2FARef.current) {
                input2FARef.current.blur();
            }
            if (!twoFactorAuthCode.trim()) {
                setFormError({twoFactorAuthCode: 'validateCodeForm.error.pleaseFillTwoFactorAuth'});
                return;
            }
            if (!ValidationUtils.isValidTwoFactorCode(twoFactorAuthCode)) {
                setFormError({twoFactorAuthCode: 'passwordForm.error.incorrect2fa'});
                return;
            }
        } else {
            if (inputValidateCodeRef.current) {
                inputValidateCodeRef.current.blur();
            }
            if (!validateCode.trim()) {
                setFormError({validateCode: 'validateCodeForm.error.pleaseFillMagicCode'});
                return;
            }
            if (!ValidationUtils.isValidValidateCode(validateCode)) {
                setFormError({validateCode: 'validateCodeForm.error.incorrectMagicCode'});
                return;
            }
        }
        setFormError({});

        const accountID = lodashGet(props.credentials, 'accountID');
        if (accountID) {
            Session.signInWithValidateCode(accountID, validateCode, props.preferredLocale, twoFactorAuthCode);
        } else {
            Session.signIn(validateCode, twoFactorAuthCode, props.preferredLocale);
        }
    }, [props.account.requiresTwoFactorAuth, props.credentials, props.preferredLocale, twoFactorAuthCode, validateCode]);

    return (
        <>
            {/* At this point, if we know the account requires 2FA we already successfully authenticated */}
            {props.account.requiresTwoFactorAuth ? (
                <View style={[styles.mv3]}>
                    <MagicCodeInput
                        autoComplete={props.autoComplete}
                        ref={input2FARef}
                        label={props.translate('common.twoFactorCode')}
                        name="twoFactorAuthCode"
                        value={twoFactorAuthCode}
                        onChangeText={(text) => onTextInput(text, 'twoFactorAuthCode')}
                        onFulfill={validateAndSubmitForm}
                        maxLength={CONST.TFA_CODE_LENGTH}
                        errorText={formError.twoFactorAuthCode ? props.translate(formError.twoFactorAuthCode) : ''}
                        hasError={hasError}
                        autoFocus
                    />
                    {hasError && <FormHelpMessage message={ErrorUtils.getLatestErrorMessage(props.account)} />}
                </View>
            ) : (
                <View style={[styles.mv3]}>
                    <MagicCodeInput
                        autoComplete={props.autoComplete}
                        ref={inputValidateCodeRef}
                        label={props.translate('common.magicCode')}
                        name="validateCode"
                        value={validateCode}
                        onChangeText={(text) => onTextInput(text, 'validateCode')}
                        onFulfill={validateAndSubmitForm}
                        errorText={formError.validateCode ? props.translate(formError.validateCode) : ''}
                        hasError={hasError}
                        autoFocus
                    />
                    {hasError && <FormHelpMessage message={ErrorUtils.getLatestErrorMessage(props.account)} />}
                    <View style={[styles.alignItemsStart]}>
                        {timeRemaining > 0 && !props.network.isOffline ? (
                            <Text style={[styles.mt2]}>
                                {props.translate('validateCodeForm.requestNewCode')}
                                <Text style={[styles.textBlue]}>00:{String(timeRemaining).padStart(2, '0')}</Text>
                            </Text>
                        ) : (
                            <PressableWithFeedback
                                style={[styles.mt2]}
                                onPress={resendValidateCode}
                                underlayColor={themeColors.componentBG}
                                disabled={props.network.isOffline}
                                hoverDimmingValue={1}
                                pressDimmingValue={0.2}
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                                accessibilityLabel={props.translate('validateCodeForm.magicCodeNotReceived')}
                            >
                                <Text style={[StyleUtils.getDisabledLinkStyles(props.network.isOffline)]}>
                                    {hasError ? props.translate('validateCodeForm.requestNewCodeAfterErrorOccurred') : props.translate('validateCodeForm.magicCodeNotReceived')}
                                </Text>
                            </PressableWithFeedback>
                        )}
                    </View>
                </View>
            )}
            <View>
                <Button
                    isDisabled={props.network.isOffline}
                    success
                    style={[styles.mv3]}
                    text={props.translate('common.signIn')}
                    isLoading={
                        props.account.isLoading && props.account.loadingForm === (props.account.requiresTwoFactorAuth ? CONST.FORMS.VALIDATE_TFA_CODE_FORM : CONST.FORMS.VALIDATE_CODE_FORM)
                    }
                    onPress={validateAndSubmitForm}
                />
                <ChangeExpensifyLoginLink onPress={clearSignInData} />
            </View>
            <View style={[styles.mt5, styles.signInPageWelcomeTextContainer]}>
                <Terms />
            </View>
        </>
    );
}

BaseValidateCodeForm.propTypes = propTypes;
BaseValidateCodeForm.defaultProps = defaultProps;
BaseValidateCodeForm.displayName = 'BaseValidateCodeForm';

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
        credentials: {key: ONYXKEYS.CREDENTIALS},
        preferredLocale: {key: ONYXKEYS.NVP_PREFERRED_LOCALE},
        session: {key: ONYXKEYS.SESSION},
    }),
    withNetwork(),
)(BaseValidateCodeForm);
