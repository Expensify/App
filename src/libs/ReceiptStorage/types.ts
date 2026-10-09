import type {ReceiptSource} from '@src/types/onyx/Transaction';

/** Owns the receipts folder. The only code that writes a file there, names one, or resolves one. */
type ReceiptStorage = {
    /** Moves a file into the receipts folder and returns its durable name. Rejects when the file did not land. */
    adopt: (uriOrPath: string, fileName?: string) => Promise<string>;

    /**
     * Replaces a receipt's bytes under the same durable name, putting the original back if the swap fails.
     * Gives up before the first rename when `shouldAbort` returns true, e.g. because an upload claimed the receipt.
     */
    overwrite: (durableName: string, uriOrPath: string, shouldAbort?: () => boolean) => Promise<string>;

    /** Deletes a file if it exists. */
    discard: (uriOrPath: string) => Promise<void>;

    /** Resolves a stored source to a file that exists, waiting for a committed swap and restoring an interrupted one. */
    locate: (source: ReceiptSource | null | undefined) => Promise<string | undefined>;

    /** Claims a receipt for reading, so an upgrade still preparing keeps the snapshot, and waits for a swap already renaming. */
    settle: (durableName: string) => Promise<void>;

    /** After a failed read, waits for a running swap and restores an interrupted one. Resolves true when the file is back. */
    recheckAfterSwap: (source: ReceiptSource | null | undefined) => Promise<boolean>;

    /** Valid for this launch only, so never store the result. */
    toLocalUri: (durableName: string) => string;

    /**
     * Claims a local source that is about to be stored in Onyx so resolve() will accept it this session.
     * No-op on native (files are durable). On web, object URLs die with the document.
     */
    retain: (source: string) => void;

    /** Re-roots a stored source onto the current folder. A remote source passes through unchanged. */
    resolve: (source: ReceiptSource | null | undefined) => string | undefined;

    /** Deletes copies an interrupted swap left in the receipts folder, once the app is idle after startup. */
    sweepLeftovers: () => Promise<void>;
};

export default ReceiptStorage;
