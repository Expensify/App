import type * as OnyxCommon from './OnyxCommon';

/** Base settings that can appear at root level or nested under feed type */
type ExpensifyCardSettingsBase = {
    /** Sum of all posted Expensify Card transactions */
    currentBalance?: number;

    /** Remaining limit for Expensify Cards on the workspace */
    remainingLimit?: number;

    /** The total amount of cash back earned thus far */
    earnedCashback?: number;

    /** The date of the last settlement */
    monthlySettlementDate?: Date;

    /** Whether monthly option should appear in the settlement frequency settings */
    isMonthlySettlementAllowed?: boolean;

    /** The previous monthly settlement date, used for reverting failed updates */
    previousMonthlySettlementDate?: Date;

    /** The bank account chosen for the card settlement */
    paymentBankAccountID?: number;

    /** Whether the card program (e.g., Travel Invoicing) is enabled */
    isEnabled?: boolean;

    /** The previous bank account chosen for the card settlement, used for reverting failed updates */
    previousPaymentBankAccountID?: number;

    /** Whether we are loading the data via the API */
    isLoading?: boolean;

    /** Error message */
    errors?: OnyxCommon.Errors;

    /** Whether the request was successful */
    isSuccess?: boolean;

    /** The preferred policy for the domain card */
    preferredPolicy?: string;

    /** The Marqeta business token */
    marqetaBusinessToken?: number;

    /** Name of the domain card was issued for */
    domainName?: string;

    /** Country code for the card program (e.g., "US") */
    country?: string;

    /** Name of the bank account used for the card settlement */
    paymentBankAccountAddressName?: string;

    /** Number of the bank account used for the card settlement */
    paymentBankAccountNumber?: string;

    /** Collections of form field errors */
    errorFields?: OnyxCommon.ErrorFields;

    /** Credit limit for the card program */
    limit?: number;

    /** Owner email for the card program */
    ownerEmail?: string;
};

/** Model of Expensify card settings for a workspace - can have nested feed types from backend */
type ExpensifyCardSettings = OnyxCommon.OnyxValueWithOfflineFeedback<
    ExpensifyCardSettingsBase & {
        /** Nested Travel Invoicing settings from backend */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        TRAVEL_US?: ExpensifyCardSettingsBase;
    }
>;

export default ExpensifyCardSettings;
export type {ExpensifyCardSettingsBase};
