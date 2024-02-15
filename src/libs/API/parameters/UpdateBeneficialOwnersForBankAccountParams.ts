import type {ACHContractStepProps} from '@src/types/form/ReimbursementAccountForm';

type UpdateBeneficialOwnersForBankAccountParams = Partial<ACHContractStepProps> & {bankAccountID: number; canUseNewVbbaFlow?: boolean};

export default UpdateBeneficialOwnersForBankAccountParams;
