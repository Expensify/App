/** Column mapping indexes for a CSV import (values are column index as numbers, or false if not mapped) */
type ColumnMappingIndexes = {
    /** Date column index or false if not mapped */
    date?: number | boolean;
    /** Merchant column index or false if not mapped */
    merchant?: number | boolean;
    /** Amount column index or false if not mapped */
    amount?: number | boolean;
    /** Category column index or false if not mapped */
    category?: number | boolean;
    /** Ignore column index or false if not mapped */
    ignore?: number | boolean;
    /** Type (debit/credit) column index or false if not mapped */
    type?: number | boolean;
};

/** Column mapping names for a CSV import (values are header names, or false if not mapped) */
type ColumnMappingNames = {
    /** Date column header name or false if not mapped */
    date?: string | boolean;
    /** Merchant column header name or false if not mapped */
    merchant?: string | boolean;
    /** Amount column header name or false if not mapped */
    amount?: string | boolean;
    /** Category column header name or false if not mapped */
    category?: string | boolean;
    /** Ignore column header name or false if not mapped */
    ignore?: string | boolean;
    /** Type (debit/credit) column header name or false if not mapped */
    type?: string | boolean;
};

/** Account details for a saved CSV layout */
type AccountDetails = {
    /** Bank type */
    bank: string;

    /** Currency code */
    currency: string;

    /** Card name (stored as accountID for oldDot compatibility) */
    accountID: string;

    /** Whether transactions are reimbursable */
    reimbursable?: boolean;
};

/** Column mapping configuration */
type ColumnMapping = {
    /** Mapping of transaction attributes to column header names */
    names: ColumnMappingNames;

    /** Mapping of transaction attributes to column indexes */
    indexes: ColumnMappingIndexes;
};

/** Column layout data for a saved CSV layout (structure matches oldDot) */
type SavedCSVColumnLayoutData = {
    /** Layout name */
    name: string;

    /** Whether to use type column for debit/credit */
    useTypeColumn: boolean;

    /** Whether to flip the amount sign */
    flipAmountSign: boolean;

    /** Whether transactions are reimbursable */
    reimbursable: boolean;

    /** Row offset (1 if has header, 0 otherwise) */
    offset: number;

    /** Date format string (null for auto-detect) */
    dateFormat?: string | null;

    /** Account details */
    accountDetails: AccountDetails;

    /** Column mapping configuration */
    columnMapping: ColumnMapping;
};

/** Saved CSV column layouts, keyed by cardID or layout name */
type SavedCSVColumnLayoutList = Record<string, SavedCSVColumnLayoutData>;

export type {ColumnMappingNames, ColumnMappingIndexes, SavedCSVColumnLayoutData, SavedCSVColumnLayoutList, AccountDetails, ColumnMapping};
