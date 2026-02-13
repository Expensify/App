import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
import type {FormInputErrors} from '@components/Form/types';
import MagicCodeInput from '@components/MagicCodeInput';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {isValidPin} from '@libs/ValidationUtils';
import {usePin} from '@pages/MissingPersonalDetails/PinContext';
import type {CustomSubPageProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * PIN entry step for UK/EU Expensify Card ordering flow.
 * Implements a two-page flow where user enters PIN, then confirms it.
 */
function Pin({onNext}: CustomSubPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {setPin, setIsVerified} = usePin();

    // Track whether we're on the initial entry or confirmation step
    const [isConfirmStep, setIsConfirmStep] = useState(false);
    const [enteredPin, setEnteredPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [isPinHidden, setIsPinHidden] = useState(true);
    const [error, setError] = useState('');

    const handlePinChange = useCallback(
        (value: string) => {
            setError('');
            if (isConfirmStep) {
                setConfirmPin(value);
            } else {
                setEnteredPin(value);
            }
        },
        [isConfirmStep],
    );

    const validatePin = useCallback((): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> = {};
        const pinToValidate = isConfirmStep ? confirmPin : enteredPin;

        if (pinToValidate.length !== CONST.EXPENSIFY_CARD.PIN.LENGTH) {
            setError(translate('cardPage.pinMustBeFourDigits'));
            return errors;
        }

        if (!isValidPin(pinToValidate)) {
            setError(translate('cardPage.invalidPin'));
            return errors;
        }

        if (isConfirmStep && confirmPin !== enteredPin) {
            setError(translate('cardPage.pinMismatch'));
            return errors;
        }

        return errors;
    }, [isConfirmStep, confirmPin, enteredPin, translate]);

    const handleSubmit = useCallback(() => {
        const errors = validatePin();
        if (Object.keys(errors).length > 0) {
            return;
        }

        if (!isConfirmStep) {
            // Move to confirmation step
            setIsConfirmStep(true);
            setConfirmPin('');
            setError('');
            return;
        }

        // PIN confirmed, save it and proceed
        setPin(confirmPin);
        setIsVerified(true);
        onNext();
    }, [validatePin, isConfirmStep, confirmPin, setPin, setIsVerified, onNext]);

    const togglePinVisibility = useCallback(() => {
        setIsPinHidden((prev) => !prev);
    }, []);

    const currentPin = isConfirmStep ? confirmPin : enteredPin;
    const title = isConfirmStep ? translate('cardPage.confirmYourPin') : translate('cardPage.setYourPin');
    const subtitle = isConfirmStep ? translate('cardPage.reenterPinToConfirm') : translate('cardPage.enterFourDigitPin');

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
            onSubmit={handleSubmit}
            submitButtonText={isConfirmStep ? translate('common.confirm') : translate('common.next')}
            style={[styles.flexGrow1, styles.ph5]}
            scrollContextEnabled={false}
            enabledWhenOffline
        >
            <View style={[styles.flex1]}>
                <Text style={[styles.textHeadlineH1, styles.mb2]}>{title}</Text>
                <Text style={[styles.textSupporting, styles.mb5]}>{subtitle}</Text>

                <View style={[styles.mb4]}>
                    <MagicCodeInput
                        autoComplete={CONST.AUTO_COMPLETE_VARIANTS.OFF}
                        name="pin"
                        value={currentPin}
                        maxLength={CONST.EXPENSIFY_CARD.PIN.LENGTH}
                        onChangeText={handlePinChange}
                        onFulfill={handleSubmit}
                        hasError={!!error}
                        autoFocus
                    />
                    {!!error && <Text style={[styles.formError, styles.mt2]}>{error}</Text>}
                </View>

                <Button
                    text={isPinHidden ? translate('cardPage.revealPin') : translate('cardPage.hidePin')}
                    onPress={togglePinVisibility}
                    style={[styles.mb4]}
                    medium
                />
            </View>
        </FormProvider>
    );
}

Pin.displayName = 'Pin';

export default Pin;
