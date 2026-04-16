import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
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

    /** Policy IDs linked to this Expensify Card feed (when present, drives feed grouping in the admin selector) */
    linkedPolicyIDs?: string[];

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

    /** Per-user monthly spend limit for travel invoicing cards (in cents) */
    monthlySpendLimitPerUser?: number;

    /** Currency for the card program (e.g. USD, GBP, EUR) */
    currency?: string;

    /** Owner email for the card program */
    ownerEmail?: string;

    /** Amount (in cents) of in-flight settlement that has been billed but not yet settled at the bank */
    pendingSettlementAmount?: number;
};

/** Spend rule filter condition */
type ExpensifyCardRuleFilter = {
    /** The left side of the filter condition (e.g., 'merchant') */
    left: ExpensifyCardRuleFilter | string;

    /** The operator for the filter, defined in CONST.SEARCH.SYNTAX_OPERATORS */
    operator: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;

    /** The right side of the filter condition */
    right: ExpensifyCardRuleFilter | string[] | string;
};

/** Expensify card rule data model */
type ExpensifyCardRule = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Date the rule was created */
    created: string;

    /** Filter AST evaluated for the transaction */
    filters: ExpensifyCardRuleFilter;

    /** Action to take when the rule is matched */
    action: ValueOf<typeof CONST.SPEND_RULES.ACTION>;
}>;

/** Model of Expensify card settings for a workspace - can have nested feed types from backend */
type ExpensifyCardSettings = OnyxCommon.OnyxValueWithOfflineFeedback<
    ExpensifyCardSettingsBase & {
        /** Nested Expensify Card settings keyed by feed country from backend */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        US?: ExpensifyCardSettingsBase;
        /** Nested settings for pre-2024 US card program from backend */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        CURRENT?: ExpensifyCardSettingsBase;
        /** Nested settings for UK/EU card program from backend */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        GB?: ExpensifyCardSettingsBase;
        /** Nested Travel Invoicing settings from backend */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        TRAVEL_US?: ExpensifyCardSettingsBase;

        /** Spend rules for the feed keyed by rule ID - stringified JSON of ExpensifyCardRule */
        cardRules?: Record<string, ExpensifyCardRule>;

        /** Whether the card settings has been loaded before */
        hasOnceLoaded?: boolean;
    }
>;

export default ExpensifyCardSettings;
export type {ExpensifyCardSettingsBase, ExpensifyCardRule, ExpensifyCardRuleFilter};
