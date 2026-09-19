import type {ReceiptSource} from '@src/types/onyx/Transaction';

/** Owns the receipts folder. The only code that writes a file there, names one, or resolves one. */
type ReceiptStorage = {
    /** Moves a file into the receipts folder and returns its durable name. Rejects when the file did not land. */
    adopt: (uriOrPath: string, fileName?: string) => Promise<string>;

    /** Valid for this launch only, so never store the result. */
    toLocalUri: (durableName: string) => string;

    /**
     * Claims a local source that is about to be stored in Onyx so resolve() will accept it this session.
     * No-op on native (files are durable). On web, object URLs die with the document.
     */
    retain: (source: string) => void;

    /** Re-roots a stored source onto the current folder. A remote source passes through unchanged. */
    resolve: (source: ReceiptSource | null | undefined) => string | undefined;
};

export default ReceiptStorage;
