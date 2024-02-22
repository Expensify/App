import type {BeneficialOwnersStepProps} from '@src/types/form/ReimbursementAccountForm';

type UpdateBeneficialOwnersForBankAccountParams = BeneficialOwnersStepProps & {bankAccountID: number; policyID: string; canUseNewVbbaFlow?: boolean};

export default UpdateBeneficialOwnersForBankAccountParams;
