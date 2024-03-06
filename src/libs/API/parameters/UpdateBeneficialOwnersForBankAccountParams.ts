import type {ACHContractStepProps} from '@src/types/form/ReimbursementAccountForm';

type UpdateBeneficialOwnersForBankAccountParams = Partial<ACHContractStepProps> & {bankAccountID: number; policyID: string; canUseNewVbbaFlow?: boolean};

export default UpdateBeneficialOwnersForBankAccountParams;
