import type {BankAccountStepProps, CompanyStepProps, ReimbursementAccountProps} from '@src/types/onyx/ReimbursementAccountDraft';

type BankAccountCompanyInformation = BankAccountStepProps & CompanyStepProps & ReimbursementAccountProps;

type UpdateCompanyInformationForBankAccountParams = BankAccountCompanyInformation & {bankAccountID: number; canUseNewVbbaFlow?: boolean};

export default UpdateCompanyInformationForBankAccountParams;
export type {BankAccountCompanyInformation};
