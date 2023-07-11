import React, {useState, useEffect, useCallback, useRef} from 'react';
import {View} from 'react-native';
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
import * as ComponentUtils from '../../libs/ComponentUtils';
import * as ValidationUtils from '../../libs/ValidationUtils';
import withToggleVisibilityView, {toggleVisibilityViewPropTypes} from '../../components/withToggleVisibilityView';
import canFocusInputOnScreenFocus from '../../libs/canFocusInputOnScreenFocus';
import * as ErrorUtils from '../../libs/ErrorUtils';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';
import FormHelpMessage from '../../components/FormHelpMessage';
import Terms from './Terms';
import PressableWithFeedback from '../../components/Pressable/PressableWithFeedback';

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Whether or not two-factor authentication is required */
        requiresTwoFactorAuth: PropTypes.bool,

        /** Whether or not a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
    }),

    /** Indicates which locale the user currently has selected */
    preferredLocale: PropTypes.string,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
    ...toggleVisibilityViewPropTypes,
};

const defaultProps = {
    account: {},
    preferredLocale: CONST.LOCALES.DEFAULT,
};

function PasswordForm(props) {
    const [formError, setFormError] = useState({});
    const [password, setPassword] = useState('');
    const [twoFactorAuthCode, setTwoFactorAuthCode] = useState('');

    const inputPasswordRef = useRef(null);
    const input2FA = useRef(null);

    /**
     * Handle text input and clear formError upon text change
     *
     * @param {String} text
     * @param {String} key
     */
    const onTextInput = (text, key) => {
        if (key === 'password') {
            setPassword(text);
        }
        if (key === 'twoFactorAuthCode') {
            setTwoFactorAuthCode(text);
        }
        setFormError({[key]: ''});

        if (props.account.errors) {
            Session.clearAccountMessages();
        }
    };

    /**
     * Clear Password from the state
     */
    const clearPassword = () => {
        setPassword('');
        inputPasswordRef.current.clear();
    };

    /**
     * Trigger the reset password flow and ensure the 2FA input field is reset to avoid it being permanently hidden
     */
    const resetPassword = () => {
        if (input2FA.current) {
            setTwoFactorAuthCode('');
            input2FA.current.clear();
        }
        setFormError({});
        Session.resetPassword();
    };

    /**
     * Clears local and Onyx sign in states
     */
    const clearSignInData = () => {
        setTwoFactorAuthCode('');
        setFormError({});
        Session.clearSignInData();
    };

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    const validateAndSubmitForm = useCallback(() => {
        const passwordTrimmed = password.trim();
        const twoFactorCodeTrimmed = twoFactorAuthCode.trim();
        const requiresTwoFactorAuth = props.account.requiresTwoFactorAuth;

        if (!passwordTrimmed) {
            setFormError({password: 'passwordForm.pleaseFillPassword'});
            return;
        }

        if (!ValidationUtils.isValidPassword(passwordTrimmed)) {
            setFormError({password: 'passwordForm.error.incorrectPassword'});
            return;
        }

        if (requiresTwoFactorAuth && !twoFactorCodeTrimmed) {
            setFormError({twoFactorAuthCode: 'passwordForm.pleaseFillTwoFactorAuth'});
            return;
        }

        if (requiresTwoFactorAuth && !ValidationUtils.isValidTwoFactorCode(twoFactorCodeTrimmed)) {
            setFormError({twoFactorAuthCode: 'passwordForm.error.incorrect2fa'});
            return;
        }

        setFormError({});

        Session.signIn(passwordTrimmed, '', twoFactorCodeTrimmed, props.preferredLocale);
    }, [password, twoFactorAuthCode, props.account.requiresTwoFactorAuth, props.preferredLocale]);

    useEffect(() => {
        if (!canFocusInputOnScreenFocus() || !inputPasswordRef.current || !props.isVisible) {
            return;
        }
        inputPasswordRef.current.focus();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want this effect to run again
    }, []);

    useEffect(() => {
        if (props.isVisible) {
            inputPasswordRef.current.focus();
        }
        if (!props.isVisible) {
            clearPassword();
        }
    }, [props.isVisible]);

    useEffect(() => {
        if (!props.account.requiresTwoFactorAuth) {
            return;
        }
        input2FA.current.focus();
    }, [props.account.requiresTwoFactorAuth]);

    useEffect(() => {
        if (twoFactorAuthCode.length !== CONST.TFA_CODE_LENGTH) {
            return;
        }
        validateAndSubmitForm();
    }, [twoFactorAuthCode, validateAndSubmitForm]);

    const isTwoFactorAuthRequired = Boolean(props.account.requiresTwoFactorAuth);
    const hasServerError = Boolean(props.account) && !_.isEmpty(props.account.errors);

    // When the 2FA required flag is set, user has already passed/completed the password field
    const passwordFieldHasError = !isTwoFactorAuthRequired && hasServerError;
    const twoFactorFieldHasError = isTwoFactorAuthRequired && hasServerError;

    return (
        <>
            <View style={[styles.mv3]}>
                <TextInput
                    ref={inputPasswordRef}
                    label={props.translate('common.password')}
                    accessibilityLabel={props.translate('common.password')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    secureTextEntry
                    autoCompleteType={ComponentUtils.PASSWORD_AUTOCOMPLETE_TYPE}
                    textContentType="password"
                    nativeID="password"
                    name="password"
                    value={password}
                    onChangeText={(text) => onTextInput(text, 'password')}
                    onSubmitEditing={validateAndSubmitForm}
                    blurOnSubmit={false}
                    errorText={formError.password ? props.translate(formError.password) : ''}
                    hasError={passwordFieldHasError}
                />
                <View style={[styles.changeExpensifyLoginLinkContainer]}>
                    <PressableWithFeedback
                        style={[styles.mt2]}
                        onPress={resetPassword}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.LINK}
                        accessibilityLabel={props.translate('passwordForm.forgot')}
                        hoverDimmingValue={1}
                    >
                        <Text style={[styles.link]}>{props.translate('passwordForm.forgot')}</Text>
                    </PressableWithFeedback>
                </View>
            </View>

            {isTwoFactorAuthRequired && (
                <View style={[styles.mv3]}>
                    <TextInput
                        ref={input2FA}
                        label={props.translate('common.twoFactorCode')}
                        accessibilityLabel={props.translate('common.twoFactorCode')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        value={twoFactorAuthCode}
                        placeholder={props.translate('passwordForm.requiredWhen2FAEnabled')}
                        placeholderTextColor={themeColors.placeholderText}
                        onChangeText={(text) => onTextInput(text, 'twoFactorAuthCode')}
                        onSubmitEditing={validateAndSubmitForm}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        blurOnSubmit={false}
                        maxLength={CONST.TFA_CODE_LENGTH}
                        errorText={formError.twoFactorAuthCode ? props.translate(formError.twoFactorAuthCode) : ''}
                        hasError={twoFactorFieldHasError}
                    />
                </View>
            )}

            {hasServerError && <FormHelpMessage message={ErrorUtils.getLatestErrorMessage(props.account)} />}

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

PasswordForm.propTypes = propTypes;
PasswordForm.defaultProps = defaultProps;
PasswordForm.displayName = 'PasswordForm';

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
        preferredLocale: {key: ONYXKEYS.NVP_PREFERRED_LOCALE},
    }),
    withToggleVisibilityView,
    withNetwork(),
)(PasswordForm);
