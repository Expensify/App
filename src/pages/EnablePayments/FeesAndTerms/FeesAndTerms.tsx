import React from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
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
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);

    const submit = () => {
        BankAccounts.acceptWalletTerms({
            hasAcceptedTerms: true,
            reportID: walletTerms?.chatReportID ?? '',
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
        <InteractiveStepWrapper
            wrapperID="FeesAndTerms"
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            headerTitle={translate('termsStep.headerTitleRefactor')}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={3}
            stepNames={CONST.WALLET.STEP_NAMES}
        >
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </InteractiveStepWrapper>
    );
}

export default FeesAndTerms;
