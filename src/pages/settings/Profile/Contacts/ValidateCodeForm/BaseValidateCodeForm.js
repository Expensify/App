import React, {useCallback, useState, useEffect, useRef, useImperativeHandle} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import MagicCodeInput from '../../../../../components/MagicCodeInput';
import * as ErrorUtils from '../../../../../libs/ErrorUtils';
import withLocalize, {withLocalizePropTypes} from '../../../../../components/withLocalize';
import ONYXKEYS from '../../../../../ONYXKEYS';
import compose from '../../../../../libs/compose';
import styles from '../../../../../styles/styles';
import OfflineWithFeedback from '../../../../../components/OfflineWithFeedback';
import * as ValidationUtils from '../../../../../libs/ValidationUtils';
import * as User from '../../../../../libs/actions/User';
import Button from '../../../../../components/Button';
import DotIndicatorMessage from '../../../../../components/DotIndicatorMessage';
import * as Session from '../../../../../libs/actions/Session';
import Text from '../../../../../components/Text';
import {withNetwork} from '../../../../../components/OnyxProvider';
import PressableWithFeedback from '../../../../../components/Pressable/PressableWithFeedback';
import themeColors from '../../../../../styles/themes/default';
import * as StyleUtils from '../../../../../styles/StyleUtils';
import CONST from '../../../../../CONST';

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
    const [formError, setFormError] = useState({});
    const [validateCode, setValidateCode] = useState('');
    const loginData = props.loginList[props.contactMethod];
    const inputValidateCodeRef = useRef();
    const validateLoginError = ErrorUtils.getEarliestErrorField(loginData, 'validateLogin');

    useImperativeHandle(props.innerRef, () => ({
        focus() {
            if (!inputValidateCodeRef.current) {
                return;
            }
            inputValidateCodeRef.current.focus();
        },
    }));

    useEffect(() => {
        Session.clearAccountMessages();
    }, []);

    useEffect(() => {
        if (!props.hasMagicCodeBeenSent) {
            return;
        }
        setValidateCode('');
        inputValidateCodeRef.current.clear();
    }, [props.hasMagicCodeBeenSent]);

    /**
     * Request a validate code / magic code be sent to verify this contact method
     */
    const resendValidateCode = () => {
        User.requestContactMethodValidateCode(props.contactMethod);
        setValidateCode('');
        inputValidateCodeRef.current.focus();
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
                        disabled={props.network.isOffline}
                        style={[styles.mr1]}
                        onPress={resendValidateCode}
                        underlayColor={themeColors.componentBG}
                        hoverDimmingValue={1}
                        pressDimmingValue={0.2}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        accessibilityLabel={props.translate('validateCodeForm.magicCodeNotReceived')}
                    >
                        <Text style={[StyleUtils.getDisabledLinkStyles(props.network.isOffline)]}>{props.translate('validateCodeForm.magicCodeNotReceived')}</Text>
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

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
    withNetwork(),
)(BaseValidateCodeForm);
