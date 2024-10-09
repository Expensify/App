import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {ACHContractStepProps, BeneficialOwnersStepProps, CompanyStepProps, ReimbursementAccountProps, RequestorStepProps} from '@src/types/form/ReimbursementAccountForm';
import type {BankName} from './Bank';
import type * as OnyxCommon from './OnyxCommon';

/** Steps to setup a reimbursement bank account */
type BankAccountStep = ValueOf<typeof CONST.BANK_ACCOUNT.STEP>;

/** Substeps to setup a reimbursement bank account */
type BankAccountSubStep = ValueOf<typeof CONST.BANK_ACCOUNT.SUBSTEP>;

/** Model of ACH data */
type ACHData = Partial<BeneficialOwnersStepProps & CompanyStepProps & RequestorStepProps & ACHContractStepProps & ReimbursementAccountProps> & {
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

    /** Weather Onfido setup is complete */
    isOnfidoSetupComplete?: boolean;

    /** Last 4 digits of the account number */
    mask?: string;

    /** Unique identifier for this account in Plaid */
    plaidAccountID?: string;

    /** Bank Account setup type (plaid or manual) */
    setupType?: string;
};

/** The step in an reimbursement account's ach data */
type ReimbursementAccountStep = BankAccountStep | '';

/** The sub step in an reimbursement account's ach data */
type ReimbursementAccountSubStep = BankAccountSubStep | '';

/** The ACHData for an reimbursement account */
type ACHDataReimbursementAccount = Omit<ACHData, 'subStep' | 'currentStep'> & {
    /** Step of the setup flow that we are on. Determines which view is presented. */
    currentStep?: ReimbursementAccountStep;

    /** Optional subStep we would like the user to start back on */
    subStep?: ReimbursementAccountSubStep;
};

/** Model of reimbursement account data */
type ReimbursementAccount = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Whether we are loading the data via the API */
    isLoading?: boolean;

    /** A date that indicates the user has been throttled */
    throttledDate?: string;

    /** Additional data for the account in setup */
    achData?: ACHDataReimbursementAccount;

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
export type {BankAccountStep, BankAccountSubStep, ACHData, ReimbursementAccountStep, ReimbursementAccountSubStep, ACHDataReimbursementAccount};
