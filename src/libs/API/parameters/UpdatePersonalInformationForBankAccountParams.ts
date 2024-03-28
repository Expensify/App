import type {RequestorStepProps} from '@src/types/form/ReimbursementAccountForm';

type UpdatePersonalInformationForBankAccountParams = RequestorStepProps & {bankAccountID: number; policyID: string; confirm: boolean};

export default UpdatePersonalInformationForBankAccountParams;
