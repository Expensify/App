import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearErrors} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Agreements from './Agreements';
import BankInfo from './BankInfo/BankInfo';
import BeneficialOwnerInfo from './BeneficialOwnerInfo/BeneficialOwnerInfo';
import BusinessInfo from './BusinessInfo/BusinessInfo';
import Country from './Country';
import Docusign from './Docusign';
import Finish from './Finish';
import SignerInfo from './SignerInfo';
import requiresDocusignStep from './utils/requiresDocusignStep';

type NonUSDVerifiedBankAccountFlowProps = {
    nonUSDBankAccountStep: string;
    setNonUSDBankAccountStep: (step: string | null) => void;
    setShouldShowContinueSetupButton: (shouldShowConnectedVerifiedBankAccount: boolean) => void;
    policyID: string | undefined;
    shouldShowContinueSetupButtonValue: boolean;
    policyCurrency: string;
    isComingFromExpensifyCard?: boolean;
};

function NonUSDVerifiedBankAccountFlow({
    nonUSDBankAccountStep,
    setNonUSDBankAccountStep,
    setShouldShowContinueSetupButton,
    policyID,
    shouldShowContinueSetupButtonValue,
    policyCurrency,
    isComingFromExpensifyCard,
}: NonUSDVerifiedBankAccountFlowProps) {
    const styles = useThemeStyles();
    const isDocusignStepRequired = requiresDocusignStep(policyCurrency);
    const stepNames = isDocusignStepRequired ? CONST.NON_USD_BANK_ACCOUNT.DOCUSIGN_REQUIRED_STEP_NAMES : CONST.NON_USD_BANK_ACCOUNT.STEP_NAMES;

    const handleNextNonUSDBankAccountStep = () => {
        switch (nonUSDBankAccountStep) {
            case CONST.NON_USD_BANK_ACCOUNT.STEP.COUNTRY:
                setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.BANK_INFO);
                break;
            case CONST.NON_USD_BANK_ACCOUNT.STEP.BANK_INFO:
                setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.BUSINESS_INFO);
                break;
            case CONST.NON_USD_BANK_ACCOUNT.STEP.BUSINESS_INFO:
                setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.BENEFICIAL_OWNER_INFO);
                break;
            case CONST.NON_USD_BANK_ACCOUNT.STEP.BENEFICIAL_OWNER_INFO:
                setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.SIGNER_INFO);
                break;
            case CONST.NON_USD_BANK_ACCOUNT.STEP.SIGNER_INFO:
                setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.AGREEMENTS);
                break;
            case CONST.NON_USD_BANK_ACCOUNT.STEP.AGREEMENTS:
                setNonUSDBankAccountStep(isDocusignStepRequired ? CONST.NON_USD_BANK_ACCOUNT.STEP.DOCUSIGN : CONST.NON_USD_BANK_ACCOUNT.STEP.FINISH);
                break;
            case CONST.NON_USD_BANK_ACCOUNT.STEP.DOCUSIGN:
                setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.FINISH);
                break;
            default:
                return null;
        }
    };

    const nonUSDBankAccountsGoBack = () => {
        clearErrors(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
        switch (nonUSDBankAccountStep) {
            case CONST.NON_USD_BANK_ACCOUNT.STEP.COUNTRY:
                setNonUSDBankAccountStep(null);
                setShouldShowContinueSetupButton(shouldShowContinueSetupButtonValue);
                break;
            case CONST.NON_USD_BANK_ACCOUNT.STEP.BANK_INFO:
                setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.COUNTRY);
                break;
            case CONST.NON_USD_BANK_ACCOUNT.STEP.BUSINESS_INFO:
                setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.BANK_INFO);
                break;
            case CONST.NON_USD_BANK_ACCOUNT.STEP.BENEFICIAL_OWNER_INFO:
                setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.BUSINESS_INFO);
                break;
            case CONST.NON_USD_BANK_ACCOUNT.STEP.SIGNER_INFO:
                setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.BENEFICIAL_OWNER_INFO);
                break;
            case CONST.NON_USD_BANK_ACCOUNT.STEP.AGREEMENTS:
                setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.SIGNER_INFO);
                break;
            case CONST.NON_USD_BANK_ACCOUNT.STEP.DOCUSIGN:
                setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.AGREEMENTS);
                break;
            case CONST.NON_USD_BANK_ACCOUNT.STEP.FINISH:
                setShouldShowContinueSetupButton(true);
                setNonUSDBankAccountStep(null);
                break;
            default:
                return null;
        }
    };

    let CurrentStep: React.JSX.Element | null;
    switch (nonUSDBankAccountStep) {
        case CONST.NON_USD_BANK_ACCOUNT.STEP.COUNTRY:
            CurrentStep = (
                <Country
                    onBackButtonPress={nonUSDBankAccountsGoBack}
                    onSubmit={handleNextNonUSDBankAccountStep}
                    policyID={policyID}
                    isComingFromExpensifyCard={isComingFromExpensifyCard}
                    stepNames={stepNames}
                />
            );
            break;
        case CONST.NON_USD_BANK_ACCOUNT.STEP.BANK_INFO:
            CurrentStep = (
                <BankInfo
                    onBackButtonPress={nonUSDBankAccountsGoBack}
                    onSubmit={handleNextNonUSDBankAccountStep}
                    policyID={policyID}
                    stepNames={stepNames}
                />
            );
            break;
        case CONST.NON_USD_BANK_ACCOUNT.STEP.BUSINESS_INFO:
            CurrentStep = (
                <BusinessInfo
                    onBackButtonPress={nonUSDBankAccountsGoBack}
                    onSubmit={handleNextNonUSDBankAccountStep}
                    stepNames={stepNames}
                />
            );
            break;
        case CONST.NON_USD_BANK_ACCOUNT.STEP.BENEFICIAL_OWNER_INFO:
            CurrentStep = (
                <BeneficialOwnerInfo
                    onBackButtonPress={nonUSDBankAccountsGoBack}
                    onSubmit={handleNextNonUSDBankAccountStep}
                    stepNames={stepNames}
                />
            );
            break;
        case CONST.NON_USD_BANK_ACCOUNT.STEP.SIGNER_INFO:
            CurrentStep = (
                <SignerInfo
                    onBackButtonPress={nonUSDBankAccountsGoBack}
                    onSubmit={handleNextNonUSDBankAccountStep}
                    stepNames={stepNames}
                />
            );
            break;
        case CONST.NON_USD_BANK_ACCOUNT.STEP.AGREEMENTS:
            CurrentStep = (
                <Agreements
                    onBackButtonPress={nonUSDBankAccountsGoBack}
                    onSubmit={handleNextNonUSDBankAccountStep}
                    policyCurrency={policyCurrency}
                    stepNames={stepNames}
                />
            );
            break;
        case CONST.NON_USD_BANK_ACCOUNT.STEP.DOCUSIGN:
            CurrentStep = (
                <Docusign
                    onBackButtonPress={nonUSDBankAccountsGoBack}
                    onSubmit={handleNextNonUSDBankAccountStep}
                    policyCurrency={policyCurrency}
                    stepNames={stepNames}
                />
            );
            break;
        case CONST.NON_USD_BANK_ACCOUNT.STEP.FINISH:
            CurrentStep = <Finish />;
            break;
        default:
            CurrentStep = null;
            break;
    }

    if (CurrentStep) {
        return <View style={styles.flex1}>{CurrentStep}</View>;
    }

    return null;
}

export default NonUSDVerifiedBankAccountFlow;
