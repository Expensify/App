import type {BankAccountStepProps, CompanyStepProps, ReimbursementAccountProps} from '@src/types/form/ReimbursementAccountForm';

type BankAccountCompanyInformation = BankAccountStepProps & CompanyStepProps & ReimbursementAccountProps;

type UpdateCompanyInformationForBankAccountParams = Partial<BankAccountCompanyInformation> & {bankAccountID: number; policyID: string | undefined; confirm: boolean};

export default UpdateCompanyInformationForBankAccountParams;
