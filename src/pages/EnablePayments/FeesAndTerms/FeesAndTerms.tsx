import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import FeesStep from './substeps/FeesStep';
import TermsStep from './substeps/TermsStep';

const termsAndFeesSubsteps: Array<React.ComponentType<SubStepProps>> = [FeesStep, TermsStep];

function FeesAndTerms() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);

    const submit = () => {
        BankAccounts.acceptWalletTerms({
            hasAcceptedTerms: true,
            reportID: walletTerms?.chatReportID,
        });
        BankAccounts.clearPersonalBankAccount();
        Wallet.resetWalletAdditionalDetailsDraft();
        Navigation.navigate(ROUTES.SETTINGS_WALLET);
    };
    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent: termsAndFeesSubsteps, startFrom: 0, onFinished: submit});

    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            Wallet.updateCurrentStep(CONST.WALLET.STEP.ONFIDO);
            return;
        }
        prevScreen();
    };

    return (
        <ScreenWrapper
            testID={FeesAndTerms.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('termsStep.headerTitleRefactor')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={3}
                    stepNames={CONST.WALLET.STEP_NAMES}
                />
            </View>
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </ScreenWrapper>
    );
}

FeesAndTerms.displayName = 'TermsAndFees';

export default FeesAndTerms;
