import {useFocusEffect} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import MagicCodeInput from '@components/MagicCodeInput';
import type {AutoCompleteVariant, MagicCodeInputHandle} from '@components/MagicCodeInput';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileSafari} from '@libs/Browser';
import {getLatestErrorField, getLatestErrorMessage} from '@libs/ErrorUtils';
import {isValidValidateCode} from '@libs/ValidationUtils';
import ValidateCodeCountdown from '@pages/signin/ValidateCodeCountdown';
import type {ValidateCodeCountdownHandle} from '@pages/signin/ValidateCodeCountdown/types';
import {clearValidateCodeActionError} from '@userActions/User';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import {getEmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';

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
    ref?: ForwardedRef<ValidateCodeFormHandle>;

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

    /** Whether to show skip button */
    shouldShowSkipButton?: boolean;

    /** Function to call when skip button is pressed */
    handleSkipButtonPress?: () => void;

    /** Whether the modal is used as a page modal. Used to determine input auto focus timing. */
    isInPageModal?: boolean;
};

function BaseValidateCodeForm({
    autoComplete = 'one-time-code',
    ref = () => {},
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
    shouldShowSkipButton = false,
    handleSkipButtonPress,
    isInPageModal = false,
}: ValidateCodeFormProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {wideRHPRouteKeys} = useContext(WideRHPContext);
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [formError, setFormError] = useState<ValidateCodeFormError>({});
    const [validateCode, setValidateCode] = useState('');
    const [isCountdownRunning, setIsCountdownRunning] = useState(true);

    const inputValidateCodeRef = useRef<MagicCodeInputHandle>(null);
    const [account = getEmptyObject<Account>()] = useOnyx(ONYXKEYS.ACCOUNT, {
        canBeMissing: true,
    });

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing doesn't achieve the same result in this case
    const shouldDisableResendValidateCode = !!isOffline || account?.isLoading;
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [canShowError, setCanShowError] = useState<boolean>(false);
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE, {canBeMissing: true});
    const validateCodeSent = useMemo(() => hasMagicCodeBeenSent ?? validateCodeAction?.validateCodeSent, [hasMagicCodeBeenSent, validateCodeAction?.validateCodeSent]);
    const latestValidateCodeError = getLatestErrorField(validateCodeAction, validateCodeActionErrorField);
    const defaultValidateCodeError = getLatestErrorField(validateCodeAction, 'actionVerified');
    const countdownRef = useRef<ValidateCodeCountdownHandle | null>(null);

    const clearDefaultValidationCodeError = useCallback(() => {
        // Clear "Failed to send magic code" error

        if (isEmptyObject(defaultValidateCodeError)) {
            return;
        }
        clearValidateCodeActionError('actionVerified');
    }, [defaultValidateCodeError]);

    useImperativeHandle(ref, () => ({
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
        if (!isCountdownRunning) {
            return;
        }

        countdownRef.current?.resetCountdown();
    }, [isCountdownRunning]);

    useEffect(() => {
        if (!validateCodeSent) {
            return;
        }
        // Delay prevents the input from gaining focus before the RHP slide out animation finishes,
        // which would cause the wide RHP to flicker in the background.
        if ((wideRHPRouteKeys.length > 0 && !isMobileSafari()) || isInPageModal) {
            focusTimeoutRef.current = setTimeout(() => {
                inputValidateCodeRef.current?.clear();
            }, CONST.ANIMATED_TRANSITION);
        } else {
            inputValidateCodeRef.current?.clear();
        }
    }, [validateCodeSent, wideRHPRouteKeys.length, isInPageModal]);

    /**
     * Request a validate code / magic code be sent to verify this contact method
     */
    const resendValidateCode = () => {
        sendValidateCode();
        inputValidateCodeRef.current?.clear();
        countdownRef.current?.resetCountdown();
        setIsCountdownRunning(true);
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

        clearDefaultValidationCodeError();
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
    }, [validateCode, handleSubmitForm, validateCodeActionErrorField, clearError, clearDefaultValidationCodeError]);

    const errorText = useMemo(() => {
        if (!canShowError) {
            return '';
        }
        if (formError?.validateCode) {
            return translate(formError?.validateCode);
        }
        return getLatestErrorMessage(account ?? {});
    }, [canShowError, formError?.validateCode, account, translate]);

    const shouldShowTimer = isCountdownRunning && !isOffline;

    const handleCountdownFinish = useCallback(() => {
        setIsCountdownRunning(false);
    }, []);

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
            />
            {shouldShowTimer && (
                <View style={[styles.mt5, styles.flexRow, styles.renderHTML]}>
                    <ValidateCodeCountdown
                        ref={countdownRef}
                        onCountdownFinish={handleCountdownFinish}
                    />
                </View>
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
                errors={canShowError ? (finalValidateError ?? defaultValidateCodeError) : defaultValidateCodeError}
                errorRowStyles={[styles.mt2, styles.textWrap]}
                onClose={() => {
                    clearError();
                    if (!isEmptyObject(validateCodeAction?.errorFields) && validateCodeActionErrorField) {
                        clearValidateCodeActionError(validateCodeActionErrorField);
                    }
                    clearDefaultValidationCodeError();
                }}
                style={buttonStyles}
            >
                {shouldShowSkipButton && (
                    <Button
                        text={translate('common.skip')}
                        onPress={handleSkipButtonPress}
                        style={[styles.mt4]}
                        success={false}
                        large
                    />
                )}
                {!hideSubmitButton && (
                    <Button
                        isDisabled={isOffline}
                        text={submitButtonText ?? translate('common.verify')}
                        onPress={validateAndSubmitForm}
                        style={[shouldShowSkipButton ? styles.mt3 : styles.mt4]}
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
