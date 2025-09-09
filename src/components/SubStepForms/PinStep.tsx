import {useFocusEffect} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {useCallback, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import type {MagicCodeInputHandle} from '@components/MagicCodeInput';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileSafari} from '@libs/Browser';
import {isRequiredFulfilled, isValidPinCode} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import type { OnyxFormValuesMapping } from '@src/ONYXKEYS';
import {getEmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';
import type { TranslationPaths } from '@src/languages/types';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import * as Expensicons from '@components/Icon/Expensicons'
import FormProvider from '@components/Form/FormProvider';
import MagicCodeInput from '@components/MagicCodeInput';
import type { SubStepProps } from '@hooks/useSubStep/types';
import { getLatestErrorMessage } from '@libs/ErrorUtils';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';
import type { FormOnyxValues } from '@components/Form/types';

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

    /** Forwarded inner ref */
    innerRef?: ForwardedRef<PinCodeFormHandle>;

    /** Function is called when submitting form  */
    handleSubmit: (values: FormOnyxValues<TFormID>) => void;
};

function PinStep<TFormID extends keyof OnyxFormValuesMapping>({
    formID,
    isEditing,
    innerRef = () => {},
    handleSubmit,
}: PinStepProps<TFormID>) {
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

    const [isRevealed, setRevealed] = useState(false);

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

    // const validate = useCallback(() => {
    //     if (!isRequiredFulfilled(pinCode)) {
    //         setFormError({pinCode: 'common.error.fieldRequired'});
    //     }

    //     if (!isValidPinCode(pinCode)) {
    //         setFormError({pinCode: 'privatePersonalDetails.error.invalidPinCode'});
    //     }

    //     return formError;
    //     },
    //     [formError, pinCode],
    // );

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     * Check if that was 
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

        setFormError({});
        handleSubmit(pinCode);
    }, [pinCode, handleSubmit]);

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
            style={[styles.mh5, styles.flexGrow1]}
            shouldHideFixErrorsAlert
        >
            <Text style={[styles.textHeadlineLineHeightXXL]}>Set the PIN for your card.</Text>
            <MagicCodeInput
                autoComplete='one-time-code'
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
                isInputMasked={isRevealed}
            />
            <OfflineWithFeedback>
                <View style={styles.ph25}>
                    <Button
                        text="Reveal PIN"
                        onPress={() => setRevealed(!isRevealed)}
                        icon={Expensicons.Eye}
                        style={styles.ph5}
                    />
                </View>
            </OfflineWithFeedback>
        </FormProvider>
    );
}

PinStep.displayName = 'RegistrationNumberStep';

export default PinStep;
