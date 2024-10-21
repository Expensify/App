import {useFocusEffect} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {useCallback, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
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
import * as Delegate from '@userActions/Delegate';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DelegateRole} from '@src/types/onyx/Account';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ValidateCodeFormHandle = {
    focus: () => void;
    focusLastSelected: () => void;
};

type ValidateCodeFormError = {
    validateCode?: TranslationPaths;
};

type BaseValidateCodeFormProps = {
    /** Specifies autocomplete hints for the system, so it can provide autofill */
    autoComplete?: AutoCompleteVariant;

    /** Forwarded inner ref */
    innerRef?: ForwardedRef<ValidateCodeFormHandle>;

    /** The email of the delegate */
    delegate: string;

    /** The role of the delegate */
    role: DelegateRole;

    /** Any additional styles to apply */
    wrapperStyle?: StyleProp<ViewStyle>;
};

function BaseValidateCodeForm({autoComplete = 'one-time-code', innerRef = () => {}, delegate, role, wrapperStyle}: BaseValidateCodeFormProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [formError, setFormError] = useState<ValidateCodeFormError>({});
    const [validateCode, setValidateCode] = useState('');
    const inputValidateCodeRef = useRef<MagicCodeInputHandle>(null);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const login = account?.primaryLogin;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing doesn't achieve the same result in this case
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const currentDelegate = account?.delegatedAccess?.delegates?.find((d) => d.email === delegate);
    const validateLoginError = ErrorUtils.getLatestErrorField(currentDelegate, 'updateDelegateRole');

    const shouldDisableResendValidateCode = !!isOffline || currentDelegate?.isLoading;

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

    /**
     * Request a validate code / magic code be sent to verify this contact method
     */
    const resendValidateCode = () => {
        if (!login) {
            return;
        }
        Delegate.requestValidationCode();

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
                Delegate.clearAddDelegateErrors(currentDelegate?.email ?? '', 'updateDelegateRole');
            }
        },
        [currentDelegate?.email, validateLoginError],
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

        Delegate.updateDelegateRole(delegate, role, validateCode);
    }, [delegate, role, validateCode]);

    return (
        <View style={[styles.flex1, styles.justifyContentBetween, wrapperStyle]}>
            <View style={[styles.ph5, styles.mt3]}>
                <MagicCodeInput
                    autoComplete={autoComplete}
                    ref={inputValidateCodeRef}
                    name="validateCode"
                    value={validateCode}
                    onChangeText={onTextInput}
                    errorText={formError?.validateCode ? translate(formError?.validateCode) : Object.values(validateLoginError ?? {}).at(0) ?? ''}
                    hasError={!isEmptyObject(validateLoginError)}
                    onFulfill={validateAndSubmitForm}
                    autoFocus={false}
                />
                <OfflineWithFeedback errorRowStyles={[styles.mt2]}>
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
                    </View>
                </OfflineWithFeedback>
            </View>
            <FixedFooter>
                <OfflineWithFeedback>
                    <Button
                        isDisabled={isOffline}
                        text={translate('common.verify')}
                        onPress={validateAndSubmitForm}
                        style={[styles.mt4]}
                        success
                        pressOnEnter
                        large
                        isLoading={currentDelegate?.isLoading}
                    />
                </OfflineWithFeedback>
            </FixedFooter>
        </View>
    );
}

BaseValidateCodeForm.displayName = 'BaseValidateCodeForm';

export type {BaseValidateCodeFormProps, ValidateCodeFormHandle};

export default BaseValidateCodeForm;
