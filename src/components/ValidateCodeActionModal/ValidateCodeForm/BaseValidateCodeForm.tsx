import {useFocusEffect} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
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
import useSafePaddingBottomStyle from '@hooks/useSafePaddingBottomStyle';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as User from '@userActions/User';
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
    buttonStyles,
}: ValidateCodeFormProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const safePaddingBottomStyle = useSafePaddingBottomStyle();

    const [formError, setFormError] = useState<ValidateCodeFormError>({});
    const [validateCode, setValidateCode] = useState('');
    const inputValidateCodeRef = useRef<MagicCodeInputHandle>(null);
    const [account = {}] = useOnyx(ONYXKEYS.ACCOUNT);
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
        clearError();
    }, [clearError]);

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
        User.requestValidateCodeAction();
        inputValidateCodeRef.current?.clear();
    };

    /**
     * Handle text input and clear formError upon text change
     */
    const onTextInput = useCallback(
        (text: string) => {
            setValidateCode(text);
            setFormError({});

            if (validateError) {
                clearError();
                User.clearValidateCodeActionError('actionVerified');
            }
        },
        [validateError, clearError],
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
        handleSubmitForm(validateCode);
    }, [validateCode, handleSubmitForm]);

    return (
        <View style={styles.flex1}>
            <MagicCodeInput
                autoComplete={autoComplete}
                ref={inputValidateCodeRef}
                name="validateCode"
                value={validateCode}
                onChangeText={onTextInput}
                errorText={formError?.validateCode ? translate(formError?.validateCode) : ErrorUtils.getLatestErrorMessage(account ?? {})}
                hasError={!isEmptyObject(validateError)}
                onFulfill={validateAndSubmitForm}
                autoFocus={false}
            />
            <OfflineWithFeedback
                pendingAction={validateCodeAction?.pendingFields?.validateCodeSent}
                errors={ErrorUtils.getLatestErrorField(validateCodeAction, 'actionVerified')}
                errorRowStyles={[styles.mt2]}
                onClose={() => User.clearValidateCodeActionError('actionVerified')}
            >
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
                    {hasMagicCodeBeenSent && (
                        <DotIndicatorMessage
                            type="success"
                            style={[styles.mt6, styles.flex0]}
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            messages={{0: translate('validateCodeModal.successfulNewCodeRequest')}}
                        />
                    )}
                </View>
            </OfflineWithFeedback>

            <View style={[styles.flex1, styles.justifyContentEnd, safePaddingBottomStyle]}>
                <OfflineWithFeedback
                    pendingAction={validatePendingAction}
                    errors={validateError}
                    errorRowStyles={[styles.mt2]}
                    onClose={() => clearError()}
                    style={buttonStyles}
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
            </View>
        </View>
    );
}

BaseValidateCodeForm.displayName = 'BaseValidateCodeForm';

export type {ValidateCodeFormProps, ValidateCodeFormHandle};

export default BaseValidateCodeForm;
