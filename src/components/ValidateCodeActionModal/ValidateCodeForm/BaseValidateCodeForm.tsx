import {useFocusEffect} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
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
import {isMobileSafari} from '@libs/Browser';
import {getLatestErrorField, getLatestErrorMessage} from '@libs/ErrorUtils';
import {isValidValidateCode} from '@libs/ValidationUtils';
import {clearValidateCodeActionError} from '@userActions/User';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ValidateCodeFormHandle = {
    focus: () => void;
    focusLastSelected: () => void;
};

type ValidateCodeFormError = {
    validateCode?: TranslationPaths;
};

type ValidateCodeFormProps = {
    /** Specifies autocomplete hints for the system, so it can provide autofill */
    autoComplete?: AutoCompleteVariant;

    /** Forwarded inner ref */
    innerRef?: ForwardedRef<ValidateCodeFormHandle>;

    hasMagicCodeBeenSent?: boolean;

    /** The pending action of magic code being sent
     * if not supplied, we will retrieve it from the validateCodeAction above: `validateCodeAction.pendingFields.validateCodeSent`
     */
    validatePendingAction?: PendingAction;

    /** The field where any magic code error will be stored. e.g. if replacing a card and magic code fails, it'll be stored in:
     * {"errorFields": {"replaceLostCard": {<timestamp>}}}
     * If replacing a virtual card, the errorField wil be 'reportVirtualCard', etc.
     * These values are set in the backend, please reach out to an internal engineer if you're adding a validate code modal to a flow.
     */
    validateCodeActionErrorField: string;

    /** The error of submitting  */
    validateError?: Errors;

    /** Function is called when submitting form  */
    handleSubmitForm: (validateCode: string) => void;

    /** Styles for the button */
    buttonStyles?: StyleProp<ViewStyle>;

    /** Function to clear error of the form */
    clearError: () => void;

    /** Whether to show the verify button  */
    hideSubmitButton?: boolean;

    /** Text for the verify button  */
    submitButtonText?: string;

    /** Function is called when validate code modal is mounted and on magic code resend */
    sendValidateCode: () => void;

    /** Whether the form is loading or not */
    isLoading?: boolean;

    /** Whether to allow auto submit again after the previous attempt fails */
    allowResubmit?: boolean;

    /** Whether to show skip button */
    shouldShowSkipButton?: boolean;

    /** Function to call when skip button is pressed */
    handleSkipButtonPress?: () => void;
};

function BaseValidateCodeForm({
    autoComplete = 'one-time-code',
    innerRef = () => {},
    hasMagicCodeBeenSent,
    validateCodeActionErrorField,
    validatePendingAction,
    validateError,
    handleSubmitForm,
    clearError,
    sendValidateCode,
    buttonStyles,
    hideSubmitButton,
    submitButtonText,
    isLoading,
    allowResubmit,
    shouldShowSkipButton = false,
    handleSkipButtonPress,
}: ValidateCodeFormProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [formError, setFormError] = useState<ValidateCodeFormError>({});
    const [validateCode, setValidateCode] = useState('');
    const inputValidateCodeRef = useRef<MagicCodeInputHandle>(null);
    const [account = {}] = useOnyx(ONYXKEYS.ACCOUNT, {
        canBeMissing: true,
    });

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing doesn't achieve the same result in this case
    const shouldDisableResendValidateCode = !!isOffline || account?.isLoading;
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(CONST.REQUEST_CODE_DELAY as number);
    const [canShowError, setCanShowError] = useState<boolean>(false);
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE, {canBeMissing: true});
    const validateCodeSent = useMemo(() => hasMagicCodeBeenSent ?? validateCodeAction?.validateCodeSent, [hasMagicCodeBeenSent, validateCodeAction?.validateCodeSent]);
    const latestValidateCodeError = getLatestErrorField(validateCodeAction, validateCodeActionErrorField);
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

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

            // Keyboard won't show if we focus the input with a delay, so we need to focus immediately.
            if (!isMobileSafari()) {
                focusTimeoutRef.current = setTimeout(() => {
                    inputValidateCodeRef.current?.focusLastSelected();
                }, CONST.ANIMATED_TRANSITION);
            } else {
                inputValidateCodeRef.current?.focusLastSelected();
            }

            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, []),
    );

    useEffect(() => {
        if (!validateCodeSent) {
            return;
        }
        inputValidateCodeRef.current?.clear();
    }, [validateCodeSent]);

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
     * Request a validate code / magic code be sent to verify this contact method
     */
    const resendValidateCode = () => {
        sendValidateCode();
        inputValidateCodeRef.current?.clear();
        setTimeRemaining(CONST.REQUEST_CODE_DELAY);
    };

    /**
     * Handle text input and clear formError upon text change
     */
    const onTextInput = useCallback(
        (text: string) => {
            setValidateCode(text);
            setFormError({});

            if (!isEmptyObject(validateError) || !isEmptyObject(latestValidateCodeError)) {
                // Clear flow specific error
                clearError();

                // Clear "incorrect magic code" error
                clearValidateCodeActionError(validateCodeActionErrorField);
            }
        },
        [validateError, clearError, latestValidateCodeError, validateCodeActionErrorField],
    );

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    const validateAndSubmitForm = useCallback(() => {
        // Clear flow specific error
        clearError();

        // Clear "incorrect magic" code error
        clearValidateCodeActionError(validateCodeActionErrorField);
        setCanShowError(true);
        if (!validateCode.trim()) {
            setFormError({validateCode: 'validateCodeForm.error.pleaseFillMagicCode'});
            return;
        }

        if (!isValidValidateCode(validateCode)) {
            setFormError({validateCode: 'validateCodeForm.error.incorrectMagicCode'});
            return;
        }

        setFormError({});
        handleSubmitForm(validateCode);
    }, [validateCode, handleSubmitForm, validateCodeActionErrorField, clearError]);

    const errorText = useMemo(() => {
        if (!canShowError) {
            return '';
        }
        if (formError?.validateCode) {
            return translate(formError?.validateCode);
        }
        return getLatestErrorMessage(account ?? {});
    }, [canShowError, formError, account, translate]);

    const shouldShowTimer = timeRemaining > 0 && !isOffline;

    // latestValidateCodeError only holds an error related to bad magic code
    // while validateError holds flow-specific errors
    const finalValidateError = !isEmptyObject(latestValidateCodeError) ? latestValidateCodeError : validateError;
    return (
        <>
            <MagicCodeInput
                autoComplete={autoComplete}
                ref={inputValidateCodeRef}
                name="validateCode"
                value={validateCode}
                onChangeText={onTextInput}
                errorText={errorText}
                hasError={canShowError && !isEmptyObject(finalValidateError)}
                onFulfill={validateAndSubmitForm}
                autoFocus={false}
                allowResubmit={allowResubmit}
            />
            {shouldShowTimer && (
                <Text style={[styles.mt5]}>
                    {translate('validateCodeForm.requestNewCode')}
                    <Text style={[styles.textBlue]}>00:{String(timeRemaining).padStart(2, '0')}</Text>
                </Text>
            )}
            <OfflineWithFeedback
                pendingAction={validateCodeAction?.pendingFields?.validateCodeSent}
                errorRowStyles={[styles.mt2]}
                onClose={() => clearValidateCodeActionError(validateCodeActionErrorField)}
            >
                {!shouldShowTimer && (
                    <View style={[styles.mt5, styles.dFlex, styles.flexColumn, styles.alignItemsStart]}>
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
                    </View>
                )}
            </OfflineWithFeedback>
            {!!validateCodeSent && (
                <DotIndicatorMessage
                    type="success"
                    style={[styles.mt6, styles.flex0]}
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    messages={{0: translate('validateCodeModal.successfulNewCodeRequest')}}
                />
            )}

            <OfflineWithFeedback
                shouldDisplayErrorAbove
                pendingAction={validatePendingAction}
                errors={canShowError ? finalValidateError : undefined}
                errorRowStyles={[styles.mt2, styles.textWrap]}
                onClose={() => {
                    clearError();
                    if (!isEmptyObject(validateCodeAction?.errorFields) && validateCodeActionErrorField) {
                        clearValidateCodeActionError(validateCodeActionErrorField);
                    }
                }}
                style={buttonStyles}
            >
                {shouldShowSkipButton && (
                    <Button
                        text={translate('common.skip')}
                        onPress={handleSkipButtonPress}
                        success={false}
                        large
                    />
                )}
                {!hideSubmitButton && (
                    <Button
                        isDisabled={isOffline}
                        text={submitButtonText ?? translate('common.verify')}
                        onPress={validateAndSubmitForm}
                        style={[styles.mt4]}
                        success
                        large
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        isLoading={account?.isLoading || isLoading}
                    />
                )}
            </OfflineWithFeedback>
        </>
    );
}

BaseValidateCodeForm.displayName = 'BaseValidateCodeForm';

export type {ValidateCodeFormProps, ValidateCodeFormHandle};

export default BaseValidateCodeForm;
