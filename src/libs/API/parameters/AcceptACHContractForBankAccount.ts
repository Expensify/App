import type {ACHContractStepProps} from '@src/types/form/ReimbursementAccountForm';

type AcceptACHContractForBankAccount = ACHContractStepProps & {bankAccountID: number; canUseNewVbbaFlow?: boolean};

export default AcceptACHContractForBankAccount;
