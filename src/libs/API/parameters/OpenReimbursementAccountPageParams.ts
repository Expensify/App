import type {BankAccountStep, BankAccountSubStep} from '@src/types/onyx/ReimbursementAccount';

type ReimbursementAccountStep = BankAccountStep | '';
type ReimbursementAccountSubStep = BankAccountSubStep | '';

type OpenReimbursementAccountPageParams = {
    stepToOpen: ReimbursementAccountStep;
    subStep: ReimbursementAccountSubStep;
    localCurrentStep: ReimbursementAccountStep;
    policyID: string;
    shouldPreserveDraft?: boolean;
};

export default OpenReimbursementAccountPageParams;
