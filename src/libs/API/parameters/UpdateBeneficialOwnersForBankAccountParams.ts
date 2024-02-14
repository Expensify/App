import type {ACHContractStepProps} from '@src/types/form/ReimbursementAccountForm';

type UpdateBeneficialOwnersForBankAccountParams = ACHContractStepProps & {bankAccountID: number; canUseNewVbbaFlow?: boolean};

export default UpdateBeneficialOwnersForBankAccountParams;
