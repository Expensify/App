import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useImperativeHandle, useRef, useState} from 'react';
import type {AutoCompleteVariant, MagicCodeInputHandle} from '@components/MagicCodeInput';
import MagicCodeInput from '@components/MagicCodeInput';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileSafari} from '@libs/Browser';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import {isValidRecoveryCode, isValidTwoFactorCode} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import type {TwoFactorAuthFormProps} from './types';

type BaseTwoFactorAuthFormProps = {
    /** AutoComplete variant for the MagicCodeInput */
    autoComplete?: AutoCompleteVariant;
} & TwoFactorAuthFormProps;

const isMobile = !canFocusInputOnScreenFocus();

function BaseTwoFactorAuthForm({
    autoComplete = 'one-time-code',
    shouldAllowRecoveryCode = false,
    onSubmit,
    onInputChange,
    errorMessage,
    shouldAutoFocus = true,
    onFocus,
    ref,
}: BaseTwoFactorAuthFormProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [twoFactorAuthCode, setTwoFactorAuthCode] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [isUsingRecoveryCode, setIsUsingRecoveryCode] = useState(false);
    const [formError, setFormError] = useState<{twoFactorAuthCode?: string; recoveryCode?: string}>({});

    const inputRef = useRef<MagicCodeInputHandle | null>(null);
    const recoveryInputRef = useRef<BaseTextInputRef | null>(null);

    const focusRecoveryInput = useCallback(() => {
        if (!recoveryInputRef.current) {
            return;
        }

        if ('focus' in recoveryInputRef.current && typeof recoveryInputRef.current.focus === 'function') {
            recoveryInputRef.current.focus();
        }
    }, []);

    const onTwoFactorCodeInput = useCallback(
        (text: string) => {
            setTwoFactorAuthCode(text);
            setFormError((prev) => ({...prev, twoFactorAuthCode: undefined}));
            onInputChange?.(text);
        },
        [onInputChange],
    );

    const onRecoveryCodeInput = useCallback(
        (text: string) => {
            setRecoveryCode(text);
            setFormError((prev) => ({...prev, recoveryCode: undefined}));
            onInputChange?.(text);
        },
        [onInputChange],
    );

    const validateAndSubmitAuthAppCode = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.blur();
        }
        const sanitizedTwoFactorCode = twoFactorAuthCode.trim();
        if (!sanitizedTwoFactorCode) {
            setFormError({twoFactorAuthCode: translate('twoFactorAuthForm.error.pleaseFillTwoFactorAuth')});
            return;
        }

        if (!isValidTwoFactorCode(sanitizedTwoFactorCode)) {
            setFormError({twoFactorAuthCode: translate('twoFactorAuthForm.error.incorrect2fa')});
            return;
        }

        setFormError({});
        onSubmit(sanitizedTwoFactorCode);
    }, [twoFactorAuthCode, translate, onSubmit]);

    const validateAndSubmitRecoveryCode = useCallback(() => {
        if (recoveryInputRef.current && 'blur' in recoveryInputRef.current && typeof recoveryInputRef.current.blur === 'function') {
            recoveryInputRef.current.blur();
        }

        const sanitizedRecoveryCode = recoveryCode.trim();
        if (!sanitizedRecoveryCode) {
            setFormError({recoveryCode: translate('recoveryCodeForm.error.pleaseFillRecoveryCode')});
            return;
        }

        if (!isValidRecoveryCode(sanitizedRecoveryCode)) {
            setFormError({recoveryCode: translate('recoveryCodeForm.error.incorrectRecoveryCode')});
            return;
        }

        setFormError({});
        onSubmit(sanitizedRecoveryCode);
    }, [recoveryCode, translate, onSubmit]);

    const validateAndSubmitForm = useCallback(() => {
        if (shouldAllowRecoveryCode && isUsingRecoveryCode) {
            validateAndSubmitRecoveryCode();
            return;
        }
        validateAndSubmitAuthAppCode();
    }, [isUsingRecoveryCode, shouldAllowRecoveryCode, validateAndSubmitAuthAppCode, validateAndSubmitRecoveryCode]);

    useImperativeHandle(ref, () => ({
        validateAndSubmitForm,
        focus() {
            if (shouldAllowRecoveryCode && isUsingRecoveryCode) {
                focusRecoveryInput();
                return;
            }
            inputRef.current?.focus();
        },
        focusLastSelected() {
            if (shouldAllowRecoveryCode && isUsingRecoveryCode) {
                focusRecoveryInput();
                return;
            }
            setTimeout(() => {
                inputRef.current?.focusLastSelected();
            }, CONST.ANIMATED_TRANSITION);
        },
    }));

    useFocusEffect(
        useCallback(() => {
            if (shouldAllowRecoveryCode && isUsingRecoveryCode) {
                if (!recoveryInputRef.current || (isMobile && !shouldAutoFocus)) {
                    return;
                }

                if (!isMobileSafari()) {
                    setTimeout(() => {
                        focusRecoveryInput();
                    }, CONST.ANIMATED_TRANSITION);
                } else {
                    focusRecoveryInput();
                }

                return;
            }
            if (!inputRef.current || (isMobile && !shouldAutoFocus)) {
                return;
            }
            if (!isMobileSafari()) {
                setTimeout(() => {
                    inputRef.current?.focusLastSelected();
                }, CONST.ANIMATED_TRANSITION);
            } else {
                inputRef.current?.focusLastSelected();
            }
        }, [focusRecoveryInput, isUsingRecoveryCode, shouldAllowRecoveryCode, shouldAutoFocus]),
    );

    const handleToggleInputType = useCallback(() => {
        if (!shouldAllowRecoveryCode) {
            return;
        }

        setIsUsingRecoveryCode((prev) => {
            const nextValue = !prev;
            if (nextValue) {
                setTwoFactorAuthCode('');
            } else {
                setRecoveryCode('');
            }
            return nextValue;
        });

        setFormError({});
        onInputChange?.('');
    }, [shouldAllowRecoveryCode, onInputChange]);

    const toggleLabelKey = isUsingRecoveryCode ? 'recoveryCodeForm.use2fa' : 'recoveryCodeForm.useRecoveryCode';

    return (
        <>
            {shouldAllowRecoveryCode && (
                <Text style={[styles.mb3]}>{translate(isUsingRecoveryCode ? 'twoFactorAuth.explainProcessToRemoveWithRecovery' : 'twoFactorAuth.explainProcessToRemove')}</Text>
            )}
            {shouldAllowRecoveryCode && isUsingRecoveryCode ? (
                <TextInput
                    ref={(input) => {
                        recoveryInputRef.current = input;
                    }}
                    value={recoveryCode}
                    onChangeText={onRecoveryCodeInput}
                    onFocus={onFocus}
                    autoFocus={shouldAutoFocus && shouldAllowRecoveryCode && isUsingRecoveryCode && (!isMobile || shouldAutoFocus)}
                    autoCapitalize="characters"
                    label={translate('recoveryCodeForm.recoveryCode')}
                    maxLength={CONST.FORM_CHARACTER_LIMIT}
                    errorText={formError.recoveryCode ?? errorMessage}
                    onSubmitEditing={validateAndSubmitForm}
                    accessibilityLabel={translate('recoveryCodeForm.recoveryCode')}
                    role={CONST.ROLE.PRESENTATION}
                    testID="recoveryCodeInput"
                />
            ) : (
                <MagicCodeInput
                    autoComplete={autoComplete}
                    name="twoFactorAuthCode"
                    value={twoFactorAuthCode}
                    onChangeText={onTwoFactorCodeInput}
                    onFocus={onFocus}
                    onFulfill={validateAndSubmitForm}
                    errorText={formError.twoFactorAuthCode ?? errorMessage}
                    ref={inputRef}
                    autoFocus={false}
                    testID="twoFactorAuthCodeInput"
                />
            )}
            {shouldAllowRecoveryCode && (
                <PressableWithFeedback
                    style={[styles.mt2]}
                    onPress={handleToggleInputType}
                    hoverDimmingValue={1}
                    accessibilityLabel={translate(toggleLabelKey)}
                >
                    <Text style={[styles.link]}>{translate(toggleLabelKey)}</Text>
                </PressableWithFeedback>
            )}
        </>
    );
}

export default BaseTwoFactorAuthForm;
