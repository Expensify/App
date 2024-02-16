import type {CompanyStepProps} from '@src/types/form/ReimbursementAccountForm';

type UpdateCompanyInformationForBankAccountParams = CompanyStepProps & {bankAccountID: number; policyID: string};

export default UpdateCompanyInformationForBankAccountParams;
