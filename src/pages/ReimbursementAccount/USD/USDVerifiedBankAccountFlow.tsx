import React from 'react';
import type {View} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import BankInfo from './BankInfo/BankInfo';
import BeneficialOwnersStep from './BeneficialOwnerInfo/BeneficialOwnersStep';
import BusinessInfo from './BusinessInfo/BusinessInfo';
import CompleteVerification from './CompleteVerification/CompleteVerification';
import ConnectBankAccount from './ConnectBankAccount/ConnectBankAccount';
import RequestorStep from './Requestor/RequestorStep';

type USDVerifiedBankAccountFlowProps = {
    USDBankAccountStep: string;
    policyID: string | undefined;
    onBackButtonPress: () => void;
    requestorStepRef: React.RefObject<View>;
    onfidoToken: string;
    setUSDBankAccountStep: (step: string | null) => void;
    setShouldShowConnectedVerifiedBankAccount: (shouldShowConnectedVerifiedBankAccount: boolean) => void;
};

function USDVerifiedBankAccountFlow({
    USDBankAccountStep,
    policyID = '',
    onBackButtonPress,
    requestorStepRef,
    onfidoToken,
    setUSDBankAccountStep,
    setShouldShowConnectedVerifiedBankAccount,
}: USDVerifiedBankAccountFlowProps) {
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);

    switch (USDBankAccountStep) {
        case CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT:
            return (
                <BankInfo
                    onBackButtonPress={onBackButtonPress}
                    policyID={policyID}
                    setUSDBankAccountStep={setUSDBankAccountStep}
                />
            );
        case CONST.BANK_ACCOUNT.STEP.REQUESTOR:
            return (
                <RequestorStep
                    ref={requestorStepRef}
                    shouldShowOnfido={!!(onfidoToken && !reimbursementAccount?.achData?.isOnfidoSetupComplete)}
                    onBackButtonPress={onBackButtonPress}
                />
            );
        case CONST.BANK_ACCOUNT.STEP.COMPANY:
            return <BusinessInfo onBackButtonPress={onBackButtonPress} />;
        case CONST.BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS:
            return <BeneficialOwnersStep onBackButtonPress={onBackButtonPress} />;
        case CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT:
            return <CompleteVerification onBackButtonPress={onBackButtonPress} />;
        case CONST.BANK_ACCOUNT.STEP.VALIDATION:
            return (
                <ConnectBankAccount
                    onBackButtonPress={onBackButtonPress}
                    setUSDBankAccountStep={setUSDBankAccountStep}
                    setShouldShowConnectedVerifiedBankAccount={setShouldShowConnectedVerifiedBankAccount}
                />
            );
        default:
            return null;
    }
}

USDVerifiedBankAccountFlow.displayName = 'USDVerifiedBankAccountFlow';

export default USDVerifiedBankAccountFlow;
