import type {ACHContractStepProps} from '@src/types/form/ReimbursementAccountForm';

type AcceptACHContractForBankAccount = ACHContractStepProps & {bankAccountID: number; policyID: string | undefined};

export default AcceptACHContractForBankAccount;
