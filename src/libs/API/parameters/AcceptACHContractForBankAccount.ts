import type {ACHContractStepProps} from '@src/types/form/ReimbursementAccountForm';

type AcceptACHContractForBankAccount = ACHContractStepProps & {bankAccountID: number; policyID: string; canUseNewVbbaFlow?: boolean};

export default AcceptACHContractForBankAccount;
