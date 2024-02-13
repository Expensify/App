import type {RequestorStepProps} from '@src/types/onyx/ReimbursementAccountDraft';

type UpdatePersonalInformationForBankAccountParams = RequestorStepProps & {bankAccountID: number; canUseNewVbbaFlow: boolean};

export default UpdatePersonalInformationForBankAccountParams;
