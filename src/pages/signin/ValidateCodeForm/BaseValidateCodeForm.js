import React, {useState, useEffect, useRef, useCallback} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import lodashIsEmpty from 'lodash/isEmpty';
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
import usePrevious from '../../../hooks/usePrevious';

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

function BaseValidateCodeForm(props) {
    const [formError, setFormError] = useState({});
    const [validateCode, setValidateCode] = useState(props.credentials.validateCode || '');
    const [twoFactorAuthCode, setTwoFactorAuthCode] = useState('');
    const [linkSent, setLinkSent] = useState(false);

    const wasVisible = usePrevious(props.isVisible);
    const required2FA = usePrevious(props.account.requiresTwoFactorAuth);
    const hadValidateCode = usePrevious(props.credentials.validateAndSubmitForm);

    const refValidateCode = useRef(null);
    const inputValidateCode = refValidateCode.current;
    const ref2FA = useRef(null);
    const input2FA = ref2FA.current;

    useEffect(() => {
        if (!canFocusInputOnScreenFocus() || !inputValidateCode || !props.isVisible) {
            return;
        }
        inputValidateCode.focus();
    }, []);

    useEffect(() => {
        if (inputValidateCode && !wasVisible && props.isVisible) {
            inputValidateCode.focus();
        }
    }, [inputValidateCode, props.isVisible, wasVisible]);

    useEffect(() => {
        if (inputValidateCode) {
            // Clear the code input if magic code valid or a new magic code was requested
            if ((wasVisible && !props.isVisible && validateCode) || (props.isVisible && linkSent && props.account.message && validateCode)) {   
                setValidateCode('');
                inputValidateCode.clear();
            }
        }
    }, [inputValidateCode, props.isVisible, props.account.message, wasVisible, linkSent, validateCode]);

    useEffect(() => {
        if (!hadValidateCode && props.credentials.validateCode) {
            setValidateCode(props.credentials.validateCode);
        }
    }, [props.credentials.validateCode, hadValidateCode]);

    useEffect(() => {
        if (input2FA && !required2FA && props.account.requiresTwoFactorAuth) {
            input2FA.focus();
        }
    }, [input2FA, props.account.requiresTwoFactorAuth, required2FA]);

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
        setLinkSent(false);

        if (props.account.errors) {
            Session.clearAccountMessages();
        }
    }
    
    /**
     * Trigger the reset validate code flow and ensure the 2FA input field is reset to avoid it being permanently hidden
     */
    const resendValidateCode = () => {
        if (input2FA) {
            setTwoFactorAuthCode('');
            input2FA.clear();
        }
        setFormError({});
        User.resendValidateCode(props.credentials.login, true);

        // Give feedback to the user to let them know the email was sent so they don't spam the button.
        setLinkSent(true);
    }

    /**
     * Clears local and Onyx sign in states
     */
    const clearSignInData = () => {
        setTwoFactorAuthCode('');
        setFormError({});
        Session.clearSignInData();
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    const validateAndSubmitForm = useCallback(() => {
        const requiresTwoFactorAuth = props.account.requiresTwoFactorAuth;
        if (requiresTwoFactorAuth) {
            if (input2FA) {
                input2FA.blur();
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
            if (inputValidateCode) {
                inputValidateCode.blur();
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

        const accountID = lodashGet(props, 'credentials.accountID');
        if (accountID) {
            Session.signInWithValidateCode(accountID, validateCode, props.preferredLocale, twoFactorAuthCode);
        } else {
            Session.signIn('', validateCode, twoFactorAuthCode, props.preferredLocale);
        }
        // We don't include props.account here because requiresTwoFactorAuth won't change, and otherwise
        // we have recursion on error (since props.account changes to include error property)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.credentials, props.preferredLocale, twoFactorAuthCode, validateCode]);

    const hasError = Boolean(props.account) && !lodashIsEmpty(props.account.errors);
    return (
        <>
            {/* At this point, if we know the account requires 2FA we already successfully authenticated */}
            {props.account.requiresTwoFactorAuth ? (
                <View style={[styles.mv3]}>
                    <MagicCodeInput
                        autoComplete={props.autoComplete}
                        ref={ref2FA}
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
                </View>
            ) : (
                <View style={[styles.mv3]}>
                    <MagicCodeInput
                        autoComplete={props.autoComplete}
                        ref={refValidateCode}
                        label={props.translate('common.magicCode')}
                        name="validateCode"
                        value={validateCode}
                        onChangeText={(text) => onTextInput(text, 'validateCode')}
                        onFulfill={validateAndSubmitForm}
                        errorText={formError.validateCode ? props.translate(formError.validateCode) : ''}
                        hasError={hasError}
                        autoFocus
                    />
                    <View style={[styles.changeExpensifyLoginLinkContainer]}>
                        {linkSent ? (
                            <Text style={[styles.mt2]}>{props.account.message ? props.translate(props.account.message) : ''}</Text>
                        ) : (
                            <PressableWithFeedback
                                style={[styles.mt2]}
                                onPress={resendValidateCode}
                                underlayColor={themeColors.componentBG}
                                hoverDimmingValue={1}
                                pressDimmingValue={0.2}
                                accessibilityRole="button"
                                accessibilityLabel={props.translate('validateCodeForm.magicCodeNotReceived')}
                            >
                                <Text style={[styles.link]}>{props.translate('validateCodeForm.magicCodeNotReceived')}</Text>
                            </PressableWithFeedback>
                        )}
                    </View>
                </View>
            )}

            {hasError && <FormHelpMessage message={ErrorUtils.getLatestErrorMessage(props.account)} />}
            <View>
                <Button
                    isDisabled={props.network.isOffline}
                    success
                    style={[styles.mv3]}
                    text={props.translate('common.signIn')}
                    isLoading={
                        props.account.isLoading &&
                        props.account.loadingForm === (props.account.requiresTwoFactorAuth ? CONST.FORMS.VALIDATE_TFA_CODE_FORM : CONST.FORMS.VALIDATE_CODE_FORM)
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
