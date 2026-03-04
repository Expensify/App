import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
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
 * Implements a flow where user enters PIN, then needs to verify it.
 */
function Pin({onNext}: CustomSubPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {pin: savedPin, setPin, isConfirmStep, setIsConfirmStep, isPinHidden, togglePinVisibility} = usePin();
    const [enteredPin, setEnteredPin] = useState(savedPin);
    const [confirmPin, setConfirmPin] = useState(savedPin);
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

    const validatePin = useCallback((): string => {
        const pinToValidate = isConfirmStep ? confirmPin : enteredPin;

        if (pinToValidate.length !== CONST.EXPENSIFY_CARD.PIN.LENGTH) {
            return translate('cardPage.pinMustBeFourDigits');
        }

        if (isConfirmStep && confirmPin !== enteredPin) {
            return translate('cardPage.pinMismatch');
        }

        if (!isValidPin(pinToValidate)) {
            return translate('cardPage.invalidPin');
        }
        return '';
    }, [isConfirmStep, confirmPin, enteredPin, translate]);

    const handleSubmit = useCallback(() => {
        const validationError = validatePin();
        if (validationError) {
            setError(validationError);
            return;
        }

        if (!isConfirmStep) {
            // Move to verification step
            setIsConfirmStep(true);
            setError('');
            return;
        }

        // PIN verified, save it and proceed
        setPin(confirmPin);
        onNext();
    }, [validatePin, isConfirmStep, setPin, confirmPin, onNext, setIsConfirmStep]);

    const currentPin = isConfirmStep ? confirmPin : enteredPin;
    const title = isConfirmStep ? translate('cardPage.confirmYourPin') : translate('cardPage.setYourPin');

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

                <View style={[styles.mb4]}>
                    <MagicCodeInput
                        key={`pin-${isConfirmStep}`}
                        autoComplete={CONST.AUTO_COMPLETE_VARIANTS.OFF}
                        name="pin"
                        value={currentPin}
                        maxLength={CONST.EXPENSIFY_CARD.PIN.LENGTH}
                        onChangeText={handlePinChange}
                        hasError={!!error}
                        autoFocus
                        secureTextEntry={isPinHidden}
                    />
                    {!!error && <Text style={[styles.formError, styles.mt2]}>{error}</Text>}
                </View>

                <View style={[styles.flexRow, styles.justifyContentCenter, styles.mb4, styles.alignItemsCenter, styles.w100]}>
                    <Button
                        text={isPinHidden ? translate('cardPage.revealPin') : translate('cardPage.hidePin')}
                        onPress={togglePinVisibility}
                        medium
                    />
                </View>
            </View>
        </FormProvider>
    );
}

Pin.displayName = 'Pin';

export default Pin;
