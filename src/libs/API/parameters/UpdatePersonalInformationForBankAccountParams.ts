import type {RequestorStepProps} from '@src/types/form/ReimbursementAccountForm';

type UpdatePersonalInformationForBankAccountParams = RequestorStepProps & {bankAccountID: number; policyID: string; canUseNewVbbaFlow: boolean};

export default UpdatePersonalInformationForBankAccountParams;
