import type * as OnyxCommon from './OnyxCommon';

type PolicyCategory = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Name of a category */
    name: string;

    /** Flag that determines if a category is active and able to be selected */
    enabled: boolean;

    /** If true, not adding a comment to a transaction with this category will trigger a violation */
    areCommentsRequired: boolean;

    /** "General Ledger code" that corresponds to this category in an accounting system. Similar to an ID. */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'GL Code': string;

    /** An ID for this category from an external accounting system */
    externalID: string;

    /** The external accounting service that this category comes from */
    origin: string;

    /** A list of errors keyed by microtime */
    errors?: OnyxCommon.Errors | null;
}>;

type PolicyCategories = Record<string, PolicyCategory>;

export type {PolicyCategory, PolicyCategories};
