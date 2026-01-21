import {useFocusEffect} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {useCallback, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
import * as Expensicons from '@components/Icon/Expensicons';
import type {MagicCodeInputHandle} from '@components/MagicCodeInput';
import MagicCodeInput from '@components/MagicCodeInput';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileSafari} from '@libs/Browser';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {isRequiredFulfilled, isValidPinCode} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';
import {getEmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';

type PinCodeFormHandle = {
    focus: () => void;
    focusLastSelected: () => void;
};

type PinCodeFormError = {
    pinCode?: TranslationPaths;
};

type PinStepProps<TFormID extends keyof OnyxFormValuesMapping> = SubStepProps & {
    /** The ID of the form */
    formID: TFormID;

    /** The title of the form */
    formTitle: string;

    /** Forwarded inner ref */
    innerRef?: ForwardedRef<PinCodeFormHandle>;

    /** Pin code from the first input  */
    pinCodeToMatch?: string;

    /** Function is called when submitting form  */
    handleSubmit: (value: string) => void;
};

function PinStep<TFormID extends keyof OnyxFormValuesMapping>({formID, formTitle, isEditing, innerRef = () => {}, pinCodeToMatch, handleSubmit}: PinStepProps<TFormID>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [formError, setFormError] = useState<PinCodeFormError>({});
    const [pinCode, setPinCode] = useState('');
    // const [finalPinCode, setFinalPinCode] = useState('');
    const inputPinCodeRef = useRef<MagicCodeInputHandle>(null);
    const [account = getEmptyObject<Account>()] = useOnyx(ONYXKEYS.ACCOUNT, {
        canBeMissing: true,
    });

    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [canShowError, setCanShowError] = useState<boolean>(false);

    const [isMasked, setRevealed] = useState(true);

    useImperativeHandle(innerRef, () => ({
        focus() {
            inputPinCodeRef.current?.focus();
        },
        focusLastSelected() {
            if (!inputPinCodeRef.current) {
                return;
            }
            if (focusTimeoutRef.current) {
                clearTimeout(focusTimeoutRef.current);
            }
            focusTimeoutRef.current = setTimeout(() => {
                inputPinCodeRef.current?.focusLastSelected();
            }, CONST.ANIMATED_TRANSITION);
        },
    }));

    useFocusEffect(
        useCallback(() => {
            if (!inputPinCodeRef.current) {
                return;
            }
            if (focusTimeoutRef.current) {
                clearTimeout(focusTimeoutRef.current);
            }

            // Keyboard won't show if we focus the input with a delay, so we need to focus immediately.
            if (!isMobileSafari()) {
                focusTimeoutRef.current = setTimeout(() => {
                    inputPinCodeRef.current?.focusLastSelected();
                }, CONST.ANIMATED_TRANSITION);
            } else {
                inputPinCodeRef.current?.focusLastSelected();
            }

            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, []),
    );

    /**
     * Handle text input and clear formError upon text change
     */
    const onCodeInput = useCallback(
        (text: string) => {
            setPinCode(text);
            setFormError({});
        },
        [setPinCode],
    );

    /**
     * Check if the pin is valid, then trigger the submit callback
     */
    const validateAndSubmitForm = useCallback(() => {
        setCanShowError(true);

        if (!isRequiredFulfilled(pinCode)) {
            setFormError({pinCode: 'common.error.fieldRequired'});
            return;
        }

        if (!isValidPinCode(pinCode)) {
            setFormError({pinCode: 'privatePersonalDetails.error.invalidPinCode'});
            return;
        }

        if (pinCodeToMatch && pinCodeToMatch !== pinCode) {
            setFormError({pinCode: 'privatePersonalDetails.error.mismatchOfPinCodes'});
            return;
        }

        setFormError({});
        handleSubmit(pinCode);
    }, [pinCode, pinCodeToMatch, handleSubmit]);

    const errorText = useMemo(() => {
        if (!canShowError) {
            return '';
        }
        if (formError?.pinCode) {
            return translate(formError?.pinCode);
        }
        return getLatestErrorMessage(account ?? {});
    }, [account, canShowError, formError, translate]);

    return (
        <FormProvider
            formID={formID}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={validateAndSubmitForm}
            style={[styles.flexGrow1, styles.ph5]}
            shouldHideFixErrorsAlert
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{formTitle}</Text>
            <View style={[styles.ph15, styles.mb6]}>
                <MagicCodeInput
                    autoComplete="one-time-code"
                    ref={inputPinCodeRef}
                    name="inputPinCode"
                    value={pinCode}
                    onChangeText={onCodeInput}
                    errorText={errorText}
                    hasError={canShowError && !isEmptyObject(formError)}
                    maxLength={4}
                    autoFocus
                    isCursorOn={false}
                    isPastingAllowed={false}
                    isInputMasked={isMasked}
                />
            </View>
            <OfflineWithFeedback>
                <View style={styles.ph25}>
                    <Button
                        text={translate(`privatePersonalDetails.${isMasked ? 'reveal' : 'hide'}Pin`)}
                        onPress={() => setRevealed(!isMasked)}
                        icon={isMasked ? Expensicons.Eye : Expensicons.EyeDisabled}
                        style={styles.flexShrink1}
                    />
                </View>
            </OfflineWithFeedback>
        </FormProvider>
    );
}

PinStep.displayName = 'PinStep';

export default PinStep;
