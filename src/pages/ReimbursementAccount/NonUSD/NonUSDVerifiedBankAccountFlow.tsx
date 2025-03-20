import React from 'react';
import CONST from '@src/CONST';
import Agreements from './Agreements';
import BankInfo from './BankInfo/BankInfo';
import BeneficialOwnerInfo from './BeneficialOwnerInfo/BeneficialOwnerInfo';
import BusinessInfo from './BusinessInfo/BusinessInfo';
import Country from './Country/Country';
import Finish from './Finish';
import SignerInfo from './SignerInfo';

type NonUSDVerifiedBankAccountFlowProps = {
    nonUSDBankAccountStep: string;
    setNonUSDBankAccountStep: (step: string | null) => void;
    setShouldShowContinueSetupButton: (shouldShowConnectedVerifiedBankAccount: boolean) => void;
    policyID: string | undefined;
    shouldShowContinueSetupButtonValue: boolean;
};

function NonUSDVerifiedBankAccountFlow({
    nonUSDBankAccountStep,
    setNonUSDBankAccountStep,
    setShouldShowContinueSetupButton,
    policyID,
    shouldShowContinueSetupButtonValue,
}: NonUSDVerifiedBankAccountFlowProps) {
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
                setNonUSDBankAccountStep(CONST.NON_USD_BANK_ACCOUNT.STEP.FINISH);
                break;
            default:
                return null;
        }
    };

    const nonUSDBankAccountsGoBack = () => {
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
            default:
                return null;
        }
    };

    switch (nonUSDBankAccountStep) {
        case CONST.NON_USD_BANK_ACCOUNT.STEP.COUNTRY:
            return (
                <Country
                    onBackButtonPress={nonUSDBankAccountsGoBack}
                    onSubmit={handleNextNonUSDBankAccountStep}
                    policyID={policyID}
                />
            );
        case CONST.NON_USD_BANK_ACCOUNT.STEP.BANK_INFO:
            return (
                <BankInfo
                    onBackButtonPress={nonUSDBankAccountsGoBack}
                    onSubmit={handleNextNonUSDBankAccountStep}
                    policyID={policyID}
                />
            );
        case CONST.NON_USD_BANK_ACCOUNT.STEP.BUSINESS_INFO:
            return (
                <BusinessInfo
                    onBackButtonPress={nonUSDBankAccountsGoBack}
                    onSubmit={handleNextNonUSDBankAccountStep}
                />
            );
        case CONST.NON_USD_BANK_ACCOUNT.STEP.BENEFICIAL_OWNER_INFO:
            return (
                <BeneficialOwnerInfo
                    onBackButtonPress={nonUSDBankAccountsGoBack}
                    onSubmit={handleNextNonUSDBankAccountStep}
                />
            );
        case CONST.NON_USD_BANK_ACCOUNT.STEP.SIGNER_INFO:
            return (
                <SignerInfo
                    onBackButtonPress={nonUSDBankAccountsGoBack}
                    onSubmit={handleNextNonUSDBankAccountStep}
                />
            );
        case CONST.NON_USD_BANK_ACCOUNT.STEP.AGREEMENTS:
            return (
                <Agreements
                    onBackButtonPress={nonUSDBankAccountsGoBack}
                    onSubmit={handleNextNonUSDBankAccountStep}
                />
            );
        case CONST.NON_USD_BANK_ACCOUNT.STEP.FINISH:
            return <Finish />;
        default:
            return null;
    }
}

NonUSDVerifiedBankAccountFlow.displayName = 'NonUSDVerifiedBankAccountFlow';

export default NonUSDVerifiedBankAccountFlow;
