import React from 'react';
import {View} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import BankInfo from './BankInfo/BankInfo';
import BeneficialOwnersStep from './BeneficialOwnerInfo/BeneficialOwnersStep';
import BusinessInfo from './BusinessInfo/BusinessInfo';
import CompleteVerification from './CompleteVerification/CompleteVerification';
import ConnectBankAccount from './ConnectBankAccount/ConnectBankAccount';
import Country from './Country';
import RequestorStep from './Requestor/RequestorStep';

type USDVerifiedBankAccountFlowProps = {
    USDBankAccountStep: string;
    policyID: string | undefined;
    onBackButtonPress: () => void;
    requestorStepRef: React.RefObject<View | null>;
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
    const styles = useThemeStyles();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});

    let CurrentStep: React.JSX.Element | null;
    switch (USDBankAccountStep) {
        case CONST.BANK_ACCOUNT.STEP.COUNTRY:
            CurrentStep = (
                <Country
                    onBackButtonPress={onBackButtonPress}
                    policyID={policyID}
                    setUSDBankAccountStep={setUSDBankAccountStep}
                    stepNames={CONST.BANK_ACCOUNT.STEP_NAMES}
                />
            );
            break;
        case CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT:
            CurrentStep = (
                <BankInfo
                    onBackButtonPress={onBackButtonPress}
                    policyID={policyID}
                    setUSDBankAccountStep={setUSDBankAccountStep}
                />
            );
            break;
        case CONST.BANK_ACCOUNT.STEP.REQUESTOR:
            CurrentStep = (
                <RequestorStep
                    ref={requestorStepRef}
                    shouldShowOnfido={!!(onfidoToken && !reimbursementAccount?.achData?.isOnfidoSetupComplete)}
                    onBackButtonPress={onBackButtonPress}
                />
            );
            break;
        case CONST.BANK_ACCOUNT.STEP.COMPANY:
            CurrentStep = <BusinessInfo onBackButtonPress={onBackButtonPress} />;
            break;
        case CONST.BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS:
            CurrentStep = <BeneficialOwnersStep onBackButtonPress={onBackButtonPress} />;
            break;
        case CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT:
            CurrentStep = <CompleteVerification onBackButtonPress={onBackButtonPress} />;
            break;
        case CONST.BANK_ACCOUNT.STEP.VALIDATION:
            CurrentStep = (
                <ConnectBankAccount
                    onBackButtonPress={onBackButtonPress}
                    setUSDBankAccountStep={setUSDBankAccountStep}
                    setShouldShowConnectedVerifiedBankAccount={setShouldShowConnectedVerifiedBankAccount}
                />
            );
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

export default USDVerifiedBankAccountFlow;
