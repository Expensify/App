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
import type {ValidateMagicCodeAction} from '@src/types/onyx';
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
    /** If the magic code has been resent previously */
    hasMagicCodeBeenSent?: boolean;

    /** Specifies autocomplete hints for the system, so it can provide autofill */
    autoComplete?: AutoCompleteVariant;

    /** Forwarded inner ref */
    innerRef?: ForwardedRef<ValidateCodeFormHandle>;

    /** The state of magic code that being sent */
    validateCodeAction?: ValidateMagicCodeAction;

    /** The pending action for submitting form */
    validatePendingAction?: PendingAction | null;

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
};

function BaseValidateCodeForm({
    hasMagicCodeBeenSent,
    autoComplete = 'one-time-code',
    innerRef = () => {},
    validateCodeAction,
    validatePendingAction,
    validateError,
    handleSubmitForm,
    clearError,
    sendValidateCode,
    buttonStyles,
    hideSubmitButton,
    submitButtonText,
    isLoading,
}: ValidateCodeFormProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [formError, setFormError] = useState<ValidateCodeFormError>({});
    const [validateCode, setValidateCode] = useState('');
    const inputValidateCodeRef = useRef<MagicCodeInputHandle>(null);
    const [account = {}] = useOnyx(ONYXKEYS.ACCOUNT);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing doesn't achieve the same result in this case
    const shouldDisableResendValidateCode = !!isOffline || account?.isLoading;
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(CONST.REQUEST_CODE_DELAY as number);
    const [canShowError, setCanShowError] = useState<boolean>(false);
    const latestActionVerifiedError = getLatestErrorField(validateCodeAction, 'actionVerified');

    const timerRef = useRef<NodeJS.Timeout>();

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
        if (!hasMagicCodeBeenSent) {
            return;
        }
        inputValidateCodeRef.current?.clear();
    }, [hasMagicCodeBeenSent]);

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

            if (!isEmptyObject(validateError) || !isEmptyObject(latestActionVerifiedError)) {
                clearError();
                clearValidateCodeActionError('actionVerified');
            }
        },
        [validateError, clearError, latestActionVerifiedError],
    );

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    const validateAndSubmitForm = useCallback(() => {
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
    }, [validateCode, handleSubmitForm]);

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
    return (
        <>
            <MagicCodeInput
                autoComplete={autoComplete}
                ref={inputValidateCodeRef}
                name="validateCode"
                value={validateCode}
                onChangeText={onTextInput}
                errorText={errorText}
                hasError={canShowError ? !isEmptyObject(validateError) : false}
                onFulfill={validateAndSubmitForm}
                autoFocus={false}
            />
            {shouldShowTimer && (
                <Text style={[styles.mt5]}>
                    {translate('validateCodeForm.requestNewCode')}
                    <Text style={[styles.textBlue]}>00:{String(timeRemaining).padStart(2, '0')}</Text>
                </Text>
            )}
            <OfflineWithFeedback
                pendingAction={validateCodeAction?.pendingFields?.validateCodeSent}
                errors={latestActionVerifiedError}
                errorRowStyles={[styles.mt2]}
                onClose={() => clearValidateCodeActionError('actionVerified')}
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
            {!!hasMagicCodeBeenSent && (
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
                errors={canShowError ? validateError : undefined}
                errorRowStyles={[styles.mt2]}
                onClose={() => clearError()}
                style={buttonStyles}
            >
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
