import type {ReceiptSource} from '@src/types/onyx/Transaction';

/** Owns the receipts folder. The only code that writes a file there, names one, or resolves one. */
type ReceiptStorage = {
    /** Moves a file into the receipts folder and returns its durable name. Rejects when the file did not land. */
    adopt: (uriOrPath: string, fileName?: string) => Promise<string>;

    /**
     * Swaps the bytes behind an adopted receipt, keeping its durable name so the confirmation preview, the
     * upload and replace-receipt all read the new file. Rejects if the receipt is not in durable storage or
     * the swap fails, leaving the original in place.
     */
    replace: (durableName: string, uriOrPath: string) => Promise<string>;

    /** Deletes a temporary file the app is done with. Resolves even when the file is already gone. */
    discard: (uriOrPath: string) => Promise<void>;

    /** Valid for this launch only, so never store the result. */
    toLocalUri: (durableName: string) => string;

    /** Re-roots a stored source onto the current folder. A remote source passes through unchanged. */
    resolve: (source: ReceiptSource | null | undefined) => string | undefined;
};

export default ReceiptStorage;
