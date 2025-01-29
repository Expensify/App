import React from 'react';
import type {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import getPlaidOAuthReceivedRedirectURI from '@libs/getPlaidOAuthReceivedRedirectURI';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import BankAccountStep from './BankAccountStep';
import BeneficialOwnersStep from './BeneficialOwnerInfo/BeneficialOwnersStep';
import BusinessInfo from './BusinessInfo/BusinessInfo';
import CompleteVerification from './CompleteVerification/CompleteVerification';
import ConnectBankAccount from './ConnectBankAccount/ConnectBankAccount';
import EnableBankAccount from './EnableBankAccount/EnableBankAccount';
import RequestorStep from './Requestor/RequestorStep';

type USDVerifiedBankAccountFlowProps = {
    USDBankAccountStep: string;
    policyName: string;
    policyID: string | undefined;
    isValidateCodeActionModalVisible: boolean;
    setIsValidateCodeActionModalVisible: (isVisible: boolean) => void;
    onBackButtonPress: () => void;
    requestorStepRef: React.RefObject<View>;
    onfidoToken: string;
};

function USDVerifiedBankAccountFlow({
    USDBankAccountStep,
    policyName,
    policyID,
    isValidateCodeActionModalVisible,
    setIsValidateCodeActionModalVisible,
    onBackButtonPress,
    requestorStepRef,
    onfidoToken,
}: USDVerifiedBankAccountFlowProps) {
    const [plaidLinkToken = ''] = useOnyx(ONYXKEYS.PLAID_LINK_TOKEN);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);

    switch (USDBankAccountStep) {
        case CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT:
            return (
                <BankAccountStep
                    reimbursementAccount={reimbursementAccount}
                    onBackButtonPress={onBackButtonPress}
                    receivedRedirectURI={getPlaidOAuthReceivedRedirectURI()}
                    plaidLinkOAuthToken={plaidLinkToken}
                    policyName={policyName}
                    policyID={policyID}
                    isValidateCodeActionModalVisible={isValidateCodeActionModalVisible}
                    toggleValidateCodeActionModal={setIsValidateCodeActionModalVisible}
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
            return <ConnectBankAccount onBackButtonPress={onBackButtonPress} />;
        case CONST.BANK_ACCOUNT.STEP.ENABLE:
            return (
                <EnableBankAccount
                    reimbursementAccount={reimbursementAccount}
                    onBackButtonPress={onBackButtonPress}
                />
            );
        default:
            return null;
    }
}

USDVerifiedBankAccountFlow.displayName = 'USDVerifiedBankAccountFlow';

export default USDVerifiedBankAccountFlow;
