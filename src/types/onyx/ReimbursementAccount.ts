import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {ACHContractStepProps, BeneficialOwnersStepProps, CompanyStepProps, RequestorStepProps} from '@src/types/form/ReimbursementAccountForm';
import type {BankName} from './Bank';
import type * as OnyxCommon from './OnyxCommon';

type BankAccountStep = ValueOf<typeof CONST.BANK_ACCOUNT.STEP>;

type BankAccountSubStep = ValueOf<typeof CONST.BANK_ACCOUNT.SUBSTEP>;

type ACHData = Partial<BeneficialOwnersStepProps & CompanyStepProps & RequestorStepProps & ACHContractStepProps> & {
    /** Step of the setup flow that we are on. Determines which view is presented. */
    currentStep?: BankAccountStep;

    /** Optional subStep we would like the user to start back on */
    subStep?: BankAccountSubStep;

    /** Bank account state */
    state?: string;

    /** Bank account ID of the VBA that we are validating is required */
    bankAccountID?: number;

    /** Bank account routing number */
    routingNumber?: string;

    /** Bank account number */
    accountNumber?: string;

    /** Bank account name */
    bankName?: BankName;

    /** Bank account owner name */
    addressName?: string;

    /** Policy ID of the workspace the bank account is being set up on */
    policyID?: string;
};

type ReimbursementAccount = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Whether we are loading the data via the API */
    isLoading?: boolean;

    /** A date that indicates the user has been throttled */
    throttledDate?: string;

    /** Additional data for the account in setup */
    achData?: ACHData;

    /** Disable validation button if max attempts exceeded */
    maxAttemptsReached?: boolean;

    /** Alert message to display above submit button */
    error?: string;

    /** Which field needs attention? */
    errorFields?: OnyxCommon.ErrorFields;

    /** Any additional error message to show */
    errors?: OnyxCommon.Errors;

    /** Draft step of the setup flow from Onyx */
    draftStep?: BankAccountStep;

    /** Should display modal to reset data */
    shouldShowResetModal?: boolean;
}>;

export default ReimbursementAccount;
export type {BankAccountStep, BankAccountSubStep, ACHData};
