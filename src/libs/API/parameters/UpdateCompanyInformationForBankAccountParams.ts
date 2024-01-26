import type {BankAccountStepProps, CompanyStepProps, ReimbursementAccountProps} from '@src/types/onyx/ReimbursementAccountDraft';

type BankAccountCompanyInformation = BankAccountStepProps & CompanyStepProps & ReimbursementAccountProps;

type UpdateCompanyInformationForBankAccountParams = BankAccountCompanyInformation & {policyID: string};

export default UpdateCompanyInformationForBankAccountParams;
export type {BankAccountCompanyInformation};
