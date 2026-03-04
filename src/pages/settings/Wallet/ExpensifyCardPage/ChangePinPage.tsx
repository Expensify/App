import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MagicCodeInput from '@components/MagicCodeInput';
import {useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isValidPin} from '@libs/ValidationUtils';
import {PinContextProvider, usePin} from '@pages/MissingPersonalDetails/PinContext';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ChangePinPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_CHANGE_PIN>;

function ChangePinPageContent({cardID}: {cardID: string}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {executeScenario} = useMultifactorAuthentication();
    const {isConfirmStep, setIsConfirmStep, isPinHidden, togglePinVisibility} = usePin();

    const [enteredPin, setEnteredPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
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
            setIsConfirmStep(true);
            setError('');
            return;
        }

        executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.CHANGE_PIN, {
            pin: confirmPin,
            cardID,
        });
    }, [validatePin, isConfirmStep, setIsConfirmStep, executeScenario, confirmPin, cardID]);

    const currentPin = isConfirmStep ? confirmPin : enteredPin;
    const title = isConfirmStep ? translate('cardPage.changeYourPin') : translate('cardPage.confirmYourChangedPin');

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ChangePinPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('cardPage.changePin')}
                onBackButtonPress={() => {
                    if (!isConfirmStep) {
                        Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(String(cardID)));
                        return;
                    }
                    setIsConfirmStep(false);
                    setConfirmPin('');
                    setError('');
                }}
            />
            <View style={[styles.flexGrow1, styles.ph5]}>
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

                <Button
                    success
                    large
                    text={isConfirmStep ? translate('common.confirm') : translate('common.next')}
                    onPress={handleSubmit}
                    style={[styles.mb5]}
                />
            </View>
        </ScreenWrapper>
    );
}

ChangePinPageContent.displayName = 'ChangePinPageContent';

function ChangePinPage({
    route: {
        params: {cardID = ''},
    },
}: ChangePinPageProps) {
    return (
        <PinContextProvider>
            <ChangePinPageContent cardID={cardID} />
        </PinContextProvider>
    );
}

ChangePinPage.displayName = 'ChangePinPage';

export default ChangePinPage;
