import type * as OnyxCommon from './OnyxCommon';

/** Model of policy category */
type PolicyCategory = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Name of a category */
    name: string;

    /** Unencoded name of a category */
    unencodedName?: string;

    /** Flag that determines if a category is active and able to be selected */
    enabled: boolean;

    /** If true, not adding a comment to a transaction with this category will trigger a violation */
    areCommentsRequired?: boolean;

    /** "General Ledger code" that corresponds to this category in an accounting system. Similar to an ID. */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'GL Code'?: string;

    /** Payroll code is used to keep track of taxes, deductions, and an employee’s earnings */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Payroll Code'?: string;

    /** An ID for this category from an external accounting system */
    externalID?: string;

    /** The external accounting service that this category comes from */
    origin?: string;

    /** The old category name of the category when we edit the category name */
    previousCategoryName?: string;

    /** A list of errors keyed by microtime */
    errors?: OnyxCommon.Errors | null;
}>;

/** Record of policy categories, indexed by their name */
type PolicyCategories = Record<string, PolicyCategory>;

export type {PolicyCategory, PolicyCategories};
