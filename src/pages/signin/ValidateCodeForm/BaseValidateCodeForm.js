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
import withToggleVisibilityView, {toggleVisibilityViewPropTypes} from '../../../components/withToggleVisibilityView';
import canFocusInputOnScreenFocus from '../../../libs/canFocusInputOnScreenFocus';
import * as ErrorUtils from '../../../libs/ErrorUtils';
import {withNetwork} from '../../../components/OnyxProvider';
import networkPropTypes from '../../../components/networkPropTypes';
import * as User from '../../../libs/actions/User';
import FormHelpMessage from '../../../components/FormHelpMessage';
import MagicCodeInput from '../../../components/MagicCodeInput';
import Terms from '../Terms';
import DotIndicatorMessage from '../../../components/DotIndicatorMessage';
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

    const prevIsVisible = usePrevious(props.isVisible);
    const prevRequiresTwoFactorAuth = usePrevious(props.account.requiresTwoFactorAuth);
    const prevValidateCode = usePrevious(props.credentials.validateCode);

    const inputValidateCodeRef = useRef();
    const input2FARef = useRef();

    useEffect(() => {
        if (!inputValidateCodeRef.current || prevIsVisible || !props.isVisible || !canFocusInputOnScreenFocus()) {
            return;
        }
        inputValidateCodeRef.current.focus();
    }, [props.isVisible, prevIsVisible]);

    useEffect(() => {
        if (!inputValidateCodeRef.current) {
            return;
        }

        if (!validateCode) {
            return;
        }

        // Clear the code input if magic code valid
        if (prevIsVisible && !props.isVisible) {
            setValidateCode('');
        }
    }, [props.isVisible, prevIsVisible, validateCode]);

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
        input2FARef.current.resetFocus();
    }, [props.account.requiresTwoFactorAuth, prevRequiresTwoFactorAuth]);

    useEffect(() => {
        // Avoid resetting the input when the linkSent is true to keep showing the sent status even when the input is empty.
        if (!inputValidateCodeRef.current || validateCode.length > 0 || linkSent) {
            return;
        }
        inputValidateCodeRef.current.clear();
    }, [validateCode, linkSent]);

    useEffect(() => {
        if (!input2FARef.current || twoFactorAuthCode.length > 0) {
            return;
        }
        input2FARef.current.clear();
    }, [twoFactorAuthCode]);

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
    };

    /**
     * Trigger the reset validate code flow and ensure the 2FA input field is reset to avoid it being permanently hidden
     */
    const resendValidateCode = () => {
        setTwoFactorAuthCode('');
        setFormError({});
        setValidateCode('');
        // We need to clear the input manually as we are preventing the hook which clears it from firing when linkSent is true.
        // Clearing the input via state will trigger the changeText on Input which resets the linkSent value but we need linkSent to show the `sent status`
        inputValidateCodeRef.current.clear();
        User.resendValidateCode(props.credentials.login, true);

        // Give feedback to the user to let them know the email was sent so they don't spam the button.
        setLinkSent(true);
    };

    /**
     * Clears local and Onyx sign in states
     */
    const clearSignInData = () => {
        setTwoFactorAuthCode('');
        setFormError({});
        setValidateCode('');
        Session.clearSignInData();
    };

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
            Session.signIn('', validateCode, twoFactorAuthCode, props.preferredLocale);
        }
    }, [props.account.requiresTwoFactorAuth, props.credentials, props.preferredLocale, twoFactorAuthCode, validateCode]);

    const hasError = Boolean(props.account) && !_.isEmpty(props.account.errors);
    const resendButtonStyle = props.network.isOffline ? styles.buttonOpacityDisabled : {};
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
                    <View>
                        <PressableWithFeedback
                            style={[styles.mt2, resendButtonStyle]}
                            onPress={resendValidateCode}
                            underlayColor={themeColors.componentBG}
                            disabled={props.network.isOffline}
                            hoverDimmingValue={1}
                            pressDimmingValue={0.2}
                            accessibilityRole="button"
                            accessibilityLabel={props.translate('validateCodeForm.magicCodeNotReceived')}
                        >
                            <Text style={[styles.link]}>{props.translate('validateCodeForm.magicCodeNotReceived')}</Text>
                        </PressableWithFeedback>
                        {linkSent && !hasError && !_.isEmpty(props.account.message) && (
                            <DotIndicatorMessage
                                type="success"
                                style={[styles.mt2]}
                                messages={{0: props.translate(props.account.message)}}
                            />
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
    }),
    withToggleVisibilityView,
    withNetwork(),
)(BaseValidateCodeForm);
