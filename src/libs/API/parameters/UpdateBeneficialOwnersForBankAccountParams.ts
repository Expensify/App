import type {ACHContractStepProps} from '@src/types/onyx/ReimbursementAccountDraft';

type UpdateBeneficialOwnersForBankAccountParams = ACHContractStepProps & {bankAccountID: number; canUseNewVbbaFlow?: boolean};

export default UpdateBeneficialOwnersForBankAccountParams;
