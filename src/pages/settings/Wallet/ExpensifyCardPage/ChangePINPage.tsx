import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MagicCodeInput from '@components/MagicCodeInput';
import {useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isValidPIN} from '@libs/ValidationUtils';
import {PINContextProvider, usePINActions, usePINState} from '@pages/MissingPersonalDetails/PINContext';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ChangePINPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_CHANGE_PIN>;

function ChangePINPageContent({cardID}: {cardID: string}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Eye', 'EyeDisabled']);
    const {executeScenario} = useMultifactorAuthentication();
    const {isConfirmStep, isPINHidden} = usePINState();
    const {setIsConfirmStep, togglePINVisibility} = usePINActions();

    const [enteredPIN, setEnteredPIN] = useState('');
    const [confirmPIN, setConfirmPIN] = useState('');
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
            setIsConfirmStep(true);
            setError('');
            return;
        }

        executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.CHANGE_PIN, {
            pin: confirmPIN,
            cardID,
        });
    }, [validatePIN, isConfirmStep, setIsConfirmStep, executeScenario, confirmPIN, cardID]);

    const currentPIN = isConfirmStep ? confirmPIN : enteredPIN;
    const title = isConfirmStep ? translate('cardPage.confirmYourChangedPin') : translate('cardPage.changeYourPin');

    return (
        <ScreenWrapper testID={ChangePINPage.displayName}>
            <HeaderWithBackButton
                title={translate('cardPage.changePin')}
                onBackButtonPress={() => {
                    if (!isConfirmStep) {
                        Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(String(cardID)));
                        return;
                    }
                    setIsConfirmStep(false);
                    setConfirmPIN('');
                    setError('');
                }}
            />
            <FullPageOfflineBlockingView>
                <View style={[styles.flexGrow1, styles.ph5]}>
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

                    <Button
                        success
                        large
                        text={isConfirmStep ? translate('common.confirm') : translate('common.next')}
                        onPress={handleSubmit}
                        style={[styles.mb5]}
                    />
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

ChangePINPageContent.displayName = 'ChangePINPageContent';

function ChangePINPage({
    route: {
        params: {cardID = ''},
    },
}: ChangePINPageProps) {
    return (
        <PINContextProvider>
            <ChangePINPageContent cardID={cardID} />
        </PINContextProvider>
    );
}

ChangePINPage.displayName = 'ChangePINPage';

export default ChangePINPage;
