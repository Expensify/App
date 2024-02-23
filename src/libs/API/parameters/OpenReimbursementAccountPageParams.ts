import type {BankAccountStep, BankAccountSubStep} from '@src/types/onyx/ReimbursementAccount';

type ReimbursementAccountStep = BankAccountStep | '';
type ReimbursementAccountSubStep = BankAccountSubStep | '';

type OpenReimbursementAccountPageParams = {
    stepToOpen: ReimbursementAccountStep;
    subStep: ReimbursementAccountSubStep;
    localCurrentStep: ReimbursementAccountStep;
    canUseNewVbbaFlow?: boolean;
    policyID: string;
};

export default OpenReimbursementAccountPageParams;
