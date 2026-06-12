import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
import MagicCodeInput from '@components/MagicCodeInput';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {isValidPIN} from '@libs/ValidationUtils';
import {usePINActions, usePINState} from '@pages/MissingPersonalDetails/PINContext';
import type {CustomSubPageProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * PIN entry step for UK/EU Expensify Card ordering flow.
 * Implements a flow where user enters PIN, then needs to verify it.
 */
function PIN({onNext}: CustomSubPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Eye', 'EyeDisabled']);
    const {PIN: savedPIN, isConfirmStep, isPINHidden} = usePINState();
    const {setPIN, setIsConfirmStep, togglePINVisibility} = usePINActions();
    const [enteredPIN, setEnteredPIN] = useState(savedPIN);
    const [confirmPIN, setConfirmPIN] = useState(savedPIN);
    const [error, setError] = useState('');

    const handlePINChange = useCallback(
        (value: string) => {
            setError('');
            if (isConfirmStep) {
                setConfirmPIN(value);
            } else {
                setEnteredPIN(value);
            }
        },
        [isConfirmStep],
    );

    const validatePIN = useCallback((): string => {
        const PINToValidate = isConfirmStep ? confirmPIN : enteredPIN;

        if (PINToValidate.length !== CONST.EXPENSIFY_CARD.PIN.LENGTH) {
            return translate('cardPage.pinMustBeFourDigits');
        }

        if (isConfirmStep && confirmPIN !== enteredPIN) {
            return translate('cardPage.pinMismatch');
        }

        if (!isValidPIN(PINToValidate)) {
            return translate('cardPage.invalidPin');
        }
        return '';
    }, [isConfirmStep, confirmPIN, enteredPIN, translate]);

    const handleSubmit = useCallback(() => {
        const validationError = validatePIN();
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
        setPIN(confirmPIN);
        onNext();
    }, [validatePIN, isConfirmStep, setPIN, confirmPIN, onNext, setIsConfirmStep]);

    const currentPIN = isConfirmStep ? confirmPIN : enteredPIN;
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

                <View style={[styles.mv4, styles.ph11]}>
                    <MagicCodeInput
                        key={`pin-${isConfirmStep}`}
                        autoComplete={CONST.AUTO_COMPLETE_VARIANTS.OFF}
                        name="pin"
                        value={currentPIN}
                        maxLength={CONST.EXPENSIFY_CARD.PIN.LENGTH}
                        onChangeText={handlePINChange}
                        hasError={!!error}
                        autoFocus
                        secureTextEntry={isPINHidden}
                    />
                    {!!error && <Text style={[styles.formError, styles.mt2]}>{error}</Text>}
                </View>

                <View style={[styles.flexRow, styles.justifyContentCenter, styles.mv4, styles.alignItemsCenter, styles.w100]}>
                    <Button
                        icon={isPINHidden ? icons.Eye : icons.EyeDisabled}
                        text={isPINHidden ? translate('cardPage.revealPin') : translate('cardPage.hidePin')}
                        onPress={togglePINVisibility}
                        medium
                    />
                </View>
            </View>
        </FormProvider>
    );
}

PIN.displayName = 'PIN';

export default PIN;
