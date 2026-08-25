import type {PolicyRuleTaxRate} from './ExpenseRuleCore';

/** Model of `report preview` report action */
type OriginalMessageReportPreview = {
    /** ID of the report to be previewed */
    linkedReportID: string;

    /** Collection of accountIDs of users mentioned in report */
    whisperedTo?: number[];
};

/** Model of settlement account locked report action */
type OriginalMessageSettlementAccountLocked = {
    /** The masked bank account number that was locked */
    maskedBankAccountNumber: string;

    /** The policy the bank account is connected to and is being notified */
    policyID: string;
};

/** Policy rules modified fields */
type PolicyRulesModifiedFields = {
    /** The value that the merchant was changed to */
    merchant?: string;

    /** The value that the amount was changed to */
    category?: string;

    /** The value that the tag was changed to */
    tag?: string;

    /** The value that the description was changed to (backend uses "comment" key) */
    comment?: string;

    /** The value that the description was changed to (display key, mapped from "comment") */
    description?: string;

    /** The value that the billable status was changed to */
    billable?: boolean;

    /** The value that the reimbursable status was changed to */
    reimbursable?: boolean;

    /** The value that the tax was changed to */
    tax?: {
        /** The tax rate being used */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        field_id_TAX: PolicyRuleTaxRate;
    };
};

/** Personal rules modified fields */
type PersonalRulesModifiedFields = {
    /** The value that the merchant was changed to */
    merchant?: string;

    /** The value that the amount was changed to */
    category?: string;

    /** The value that the tag was changed to */
    tag?: string;

    /** The value that the description was changed to (backend uses "comment" key) */
    comment?: string;

    /** The value that the description was changed to (display key, mapped from "comment") */
    description?: string;

    /** The value that the billable status was changed to */
    billable?: boolean;

    /** The value that the reimbursable status was changed to */
    reimbursable?: boolean;

    /** The value that the tax was changed to */
    tax?: {
        /** The tax rate being used */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        field_id_TAX: PolicyRuleTaxRate;
    };

    /** The value that the report name was set to */
    reportName?: string;
};

export type {OriginalMessageReportPreview, OriginalMessageSettlementAccountLocked, PersonalRulesModifiedFields, PolicyRulesModifiedFields};
