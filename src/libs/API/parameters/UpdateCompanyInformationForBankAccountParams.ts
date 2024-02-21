import type {CompanyStepProps} from '@src/types/form/ReimbursementAccountForm';

type UpdateCompanyInformationForBankAccountParams = CompanyStepProps & {bankAccountID: number; policyID: string; canUseNewVbbaFlow?: boolean};

export default UpdateCompanyInformationForBankAccountParams;
