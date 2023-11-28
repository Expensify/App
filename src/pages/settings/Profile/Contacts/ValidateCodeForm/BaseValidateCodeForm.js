import {useFocusEffect} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import MagicCodeInput from '@components/MagicCodeInput';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {withNetwork} from '@components/OnyxProvider';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as Session from '@userActions/Session';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    ...withLocalizePropTypes,

    /** The contact method being valdiated */
    contactMethod: PropTypes.string.isRequired,

    /** If the magic code has been resent previously */
    hasMagicCodeBeenSent: PropTypes.bool.isRequired,

    /** Login list for the user that is signed in */
    loginList: PropTypes.shape({
        /** Value of partner name */
        partnerName: PropTypes.string,

        /** Phone/Email associated with user */
        partnerUserID: PropTypes.string,

        /** Date when login was validated */
        validatedDate: PropTypes.string,

        /** Field-specific server side errors keyed by microtime */
        errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),

        /** Field-specific pending states for offline UI status */
        pendingFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    }).isRequired,

    /** Forwarded inner ref */
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Whether or not a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
    }),

    /** Specifies autocomplete hints for the system, so it can provide autofill */
    autoComplete: PropTypes.oneOf(['sms-otp', 'one-time-code']).isRequired,
};

const defaultProps = {
    account: {},
    innerRef: () => {},
};

function BaseValidateCodeForm(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [formError, setFormError] = useState({});
    const [validateCode, setValidateCode] = useState('');
    const loginData = props.loginList[props.contactMethod];
    const inputValidateCodeRef = useRef();
    const validateLoginError = ErrorUtils.getEarliestErrorField(loginData, 'validateLogin');
    const shouldDisableResendValidateCode = props.network.isOffline || props.account.isLoading;
    const focusTimeoutRef = useRef(null);

    useImperativeHandle(props.innerRef, () => ({
        focus() {
            if (!inputValidateCodeRef.current) {
                return;
            }
            inputValidateCodeRef.current.focus();
        },
    }));

    useFocusEffect(
        useCallback(() => {
            if (!inputValidateCodeRef.current) {
                return;
            }
            focusTimeoutRef.current = setTimeout(inputValidateCodeRef.current.focus, CONST.ANIMATED_TRANSITION);
            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, []),
    );

    useEffect(() => {
        Session.clearAccountMessages();
        if (!validateLoginError) {
            return;
        }
        User.clearContactMethodErrors(props.contactMethod, 'validateLogin');
        // contactMethod is not added as a dependency since it does not change between renders
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!props.hasMagicCodeBeenSent) {
            return;
        }
        inputValidateCodeRef.current.clear();
    }, [props.hasMagicCodeBeenSent]);

    /**
     * Request a validate code / magic code be sent to verify this contact method
     */
    const resendValidateCode = () => {
        User.requestContactMethodValidateCode(props.contactMethod);
        inputValidateCodeRef.current.clear();
    };

    /**
     * Handle text input and clear formError upon text change
     *
     * @param {String} text
     */
    const onTextInput = useCallback(
        (text) => {
            setValidateCode(text);
            setFormError({});

            if (validateLoginError) {
                User.clearContactMethodErrors(props.contactMethod, 'validateLogin');
            }
        },
        [validateLoginError, props.contactMethod],
    );

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    const validateAndSubmitForm = useCallback(() => {
        if (!validateCode.trim()) {
            setFormError({validateCode: 'validateCodeForm.error.pleaseFillMagicCode'});
            return;
        }

        if (!ValidationUtils.isValidValidateCode(validateCode)) {
            setFormError({validateCode: 'validateCodeForm.error.incorrectMagicCode'});
            return;
        }

        setFormError({});
        User.validateSecondaryLogin(props.contactMethod, validateCode);
    }, [validateCode, props.contactMethod]);

    return (
        <>
            <MagicCodeInput
                autoComplete={props.autoComplete}
                ref={inputValidateCodeRef}
                label={props.translate('common.magicCode')}
                name="validateCode"
                value={validateCode}
                onChangeText={onTextInput}
                errorText={formError.validateCode ? props.translate(formError.validateCode) : ErrorUtils.getLatestErrorMessage(props.account)}
                hasError={!_.isEmpty(validateLoginError)}
                onFulfill={validateAndSubmitForm}
                autoFocus={false}
            />
            <OfflineWithFeedback
                pendingAction={lodashGet(loginData, 'pendingFields.validateCodeSent', null)}
                errors={ErrorUtils.getLatestErrorField(loginData, 'validateCodeSent')}
                errorRowStyles={[styles.mt2]}
                onClose={() => User.clearContactMethodErrors(props.contactMethod, 'validateCodeSent')}
            >
                <View style={[styles.mt2, styles.dFlex, styles.flexColumn, styles.alignItemsStart]}>
                    <PressableWithFeedback
                        disabled={shouldDisableResendValidateCode}
                        style={[styles.mr1]}
                        onPress={resendValidateCode}
                        underlayColor={theme.componentBG}
                        hoverDimmingValue={1}
                        pressDimmingValue={0.2}
                        role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        accessibilityLabel={props.translate('validateCodeForm.magicCodeNotReceived')}
                    >
                        <Text style={[StyleUtils.getDisabledLinkStyles(shouldDisableResendValidateCode)]}>{props.translate('validateCodeForm.magicCodeNotReceived')}</Text>
                    </PressableWithFeedback>
                    {props.hasMagicCodeBeenSent && (
                        <DotIndicatorMessage
                            type="success"
                            style={[styles.mt6, styles.flex0]}
                            messages={{0: 'resendValidationForm.linkHasBeenResent'}}
                        />
                    )}
                </View>
            </OfflineWithFeedback>
            <OfflineWithFeedback
                pendingAction={lodashGet(loginData, 'pendingFields.validateLogin', null)}
                errors={validateLoginError}
                errorRowStyles={[styles.mt2]}
                onClose={() => User.clearContactMethodErrors(props.contactMethod, 'validateLogin')}
            >
                <Button
                    isDisabled={props.network.isOffline}
                    text={props.translate('common.verify')}
                    onPress={validateAndSubmitForm}
                    style={[styles.mt4]}
                    success
                    pressOnEnter
                    isLoading={props.account.isLoading}
                />
            </OfflineWithFeedback>
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
    }),
    withNetwork(),
)(BaseValidateCodeForm);
