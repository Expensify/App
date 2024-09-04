import {useFocusEffect} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import MagicCodeInput from '@components/MagicCodeInput';
import type {AutoCompleteVariant, MagicCodeInputHandle} from '@components/MagicCodeInput';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as Session from '@userActions/Session';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account, LoginList, PendingContactAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ValidateCodeFormHandle = {
    focus: () => void;
    focusLastSelected: () => void;
};

type ValidateCodeFormError = {
    validateCode?: TranslationPaths;
};

type BaseValidateCodeFormOnyxProps = {
    /** The details about the account that the user is signing in with */
    account: OnyxEntry<Account>;
};

type ValidateCodeFormProps = {
    /** The contact method being valdiated */
    contactMethod: string;

    /** If the magic code has been resent previously */
    hasMagicCodeBeenSent?: boolean;

    /** Login list for the user that is signed in */
    loginList?: LoginList;

    /** Specifies autocomplete hints for the system, so it can provide autofill */
    autoComplete?: AutoCompleteVariant;

    /** Forwarded inner ref */
    innerRef?: ForwardedRef<ValidateCodeFormHandle>;

    /** Whether we are validating the action taken to add the magic code */
    isValidatingAction?: boolean;

    /** The contact that's going to be added after successful validation */
    pendingContact?: PendingContactAction;
};

type BaseValidateCodeFormProps = BaseValidateCodeFormOnyxProps & ValidateCodeFormProps;

function BaseValidateCodeForm({
    account = {},
    contactMethod,
    hasMagicCodeBeenSent,
    loginList,
    autoComplete = 'one-time-code',
    innerRef = () => {},
    isValidatingAction = false,
    pendingContact,
}: BaseValidateCodeFormProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [formError, setFormError] = useState<ValidateCodeFormError>({});
    const [validateCode, setValidateCode] = useState('');
    const loginData = loginList?.[pendingContact?.contactMethod ?? contactMethod];
    const inputValidateCodeRef = useRef<MagicCodeInputHandle>(null);
    const validateLoginError = ErrorUtils.getEarliestErrorField(loginData, 'validateLogin');
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing doesn't achieve the same result in this case
    const shouldDisableResendValidateCode = !!isOffline || account?.isLoading;
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useImperativeHandle(innerRef, () => ({
        focus() {
            inputValidateCodeRef.current?.focus();
        },
        focusLastSelected() {
            if (!inputValidateCodeRef.current) {
                return;
            }
            if (focusTimeoutRef.current) {
                clearTimeout(focusTimeoutRef.current);
            }
            focusTimeoutRef.current = setTimeout(() => {
                inputValidateCodeRef.current?.focusLastSelected();
            }, CONST.ANIMATED_TRANSITION);
        },
    }));

    useFocusEffect(
        useCallback(() => {
            if (!inputValidateCodeRef.current) {
                return;
            }
            if (focusTimeoutRef.current) {
                clearTimeout(focusTimeoutRef.current);
            }
            focusTimeoutRef.current = setTimeout(() => {
                inputValidateCodeRef.current?.focusLastSelected();
            }, CONST.ANIMATED_TRANSITION);
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
        User.clearContactMethodErrors(contactMethod, 'validateLogin');
        // contactMethod is not added as a dependency since it does not change between renders
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!hasMagicCodeBeenSent) {
            return;
        }
        inputValidateCodeRef.current?.clear();
    }, [hasMagicCodeBeenSent]);

    /**
     * Request a validate code / magic code be sent to verify this contact method
     */
    const resendValidateCode = () => {
        if (!!pendingContact?.contactMethod && isValidatingAction) {
            User.saveNewContactMethodAndRequestValidationCode(pendingContact?.contactMethod);
        } else {
            User.requestContactMethodValidateCode(contactMethod);
        }

        inputValidateCodeRef.current?.clear();
    };

    /**
     * Handle text input and clear formError upon text change
     */
    const onTextInput = useCallback(
        (text: string) => {
            setValidateCode(text);
            setFormError({});

            if (validateLoginError) {
                User.clearContactMethodErrors(contactMethod, 'validateLogin');
            }
        },
        [validateLoginError, contactMethod],
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

        if (!!pendingContact?.contactMethod && isValidatingAction) {
            User.addNewContactMethod(pendingContact?.contactMethod, validateCode);
            return;
        }

        User.validateSecondaryLogin(loginList, contactMethod, validateCode);
    }, [loginList, validateCode, contactMethod, isValidatingAction, pendingContact?.contactMethod]);

    return (
        <>
            <MagicCodeInput
                autoComplete={autoComplete}
                ref={inputValidateCodeRef}
                name="validateCode"
                value={validateCode}
                onChangeText={onTextInput}
                errorText={formError?.validateCode ? translate(formError?.validateCode) : ErrorUtils.getLatestErrorMessage(account ?? {})}
                hasError={!isEmptyObject(validateLoginError)}
                onFulfill={validateAndSubmitForm}
                autoFocus={false}
            />
            <OfflineWithFeedback
                pendingAction={pendingContact?.pendingFields?.validateCodeSent ?? loginData?.pendingFields?.validateCodeSent}
                errors={ErrorUtils.getLatestErrorField(pendingContact ?? loginData, pendingContact ? 'actionVerified' : 'validateCodeSent')}
                errorRowStyles={[styles.mt2]}
                onClose={() => User.clearContactMethodErrors(contactMethod, 'validateCodeSent')}
            >
                <View style={[styles.mt2, styles.dFlex, styles.flexColumn, styles.alignItemsStart]}>
                    <PressableWithFeedback
                        disabled={shouldDisableResendValidateCode}
                        style={[styles.mr1]}
                        onPress={resendValidateCode}
                        underlayColor={theme.componentBG}
                        hoverDimmingValue={1}
                        pressDimmingValue={0.2}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('validateCodeForm.magicCodeNotReceived')}
                    >
                        <Text style={[StyleUtils.getDisabledLinkStyles(shouldDisableResendValidateCode)]}>{translate('validateCodeForm.magicCodeNotReceived')}</Text>
                    </PressableWithFeedback>
                    {(hasMagicCodeBeenSent ?? !!pendingContact?.validateCodeSent) && (
                        <DotIndicatorMessage
                            type="success"
                            style={[styles.mt6, styles.flex0]}
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            messages={{0: pendingContact?.validateCodeSent ? translate('validateCodeModal.successfulNewCodeRequest') : translate('resendValidationForm.linkHasBeenResent')}}
                        />
                    )}
                </View>
            </OfflineWithFeedback>
            <OfflineWithFeedback
                pendingAction={loginData?.pendingFields?.validateLogin}
                errors={validateLoginError}
                errorRowStyles={[styles.mt2]}
                onClose={() => User.clearContactMethodErrors(contactMethod, 'validateLogin')}
            >
                <Button
                    isDisabled={isOffline}
                    text={translate('common.verify')}
                    onPress={validateAndSubmitForm}
                    style={[styles.mt4]}
                    success
                    pressOnEnter
                    large
                    isLoading={account?.isLoading}
                />
            </OfflineWithFeedback>
        </>
    );
}

BaseValidateCodeForm.displayName = 'BaseValidateCodeForm';

export type {ValidateCodeFormProps, ValidateCodeFormHandle};

export default withOnyx<BaseValidateCodeFormProps, BaseValidateCodeFormOnyxProps>({
    account: {key: ONYXKEYS.ACCOUNT},
})(BaseValidateCodeForm);
