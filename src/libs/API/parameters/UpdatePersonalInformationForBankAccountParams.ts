import type {RequestorStepProps} from '@src/types/form/ReimbursementAccountForm';

type UpdatePersonalInformationForBankAccountParams = RequestorStepProps & {bankAccountID: number; canUseNewVbbaFlow: boolean};

export default UpdatePersonalInformationForBankAccountParams;
