import type {RequestorStepProps} from '@src/types/form/ReimbursementAccountForm';

type UpdatePersonalInformationForBankAccountParams = RequestorStepProps & {bankAccountID: number; policyID: string};

export default UpdatePersonalInformationForBankAccountParams;
