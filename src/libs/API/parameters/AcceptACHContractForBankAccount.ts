import type {ACHContractStepProps} from '@src/types/onyx/ReimbursementAccountDraft';

type AcceptACHContractForBankAccount = ACHContractStepProps & {bankAccountID: number; canUseNewVbbaFlow?: boolean};

export default AcceptACHContractForBankAccount;
