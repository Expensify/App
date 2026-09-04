import type {ReceiptSource} from '@src/types/onyx/Transaction';

/** Owns the receipts folder. The only code that writes a file there, names one, or resolves one. */
type ReceiptStorage = {
    /** Moves a file into the receipts folder and returns its durable name. Rejects when the file did not land. */
    adopt: (uriOrPath: string, fileName?: string) => Promise<string>;

    /** Valid for this launch only, so never store the result. */
    toLocalUri: (durableName: string) => string;

    /** Re-roots a stored source onto the current folder. A remote source passes through unchanged. */
    resolve: (source: ReceiptSource | null | undefined) => string | undefined;

    /** Whether a stored path sits in the receipts folder. */
    isInDurableFolder: (storedPath: ReceiptSource | null | undefined) => boolean;
};

export default ReceiptStorage;
