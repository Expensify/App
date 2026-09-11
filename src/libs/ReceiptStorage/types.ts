import type {ReceiptSource} from '@src/types/onyx/Transaction';

/*
 * A receipt is identified by its durable name for as long as it exists, and a better capture replaces the
 * bytes behind that name rather than arriving as a second file.
 *
 * Pointing the receipt at a new file instead has no single place to update the pointer: the upload reads
 * the source off the in-memory receipt object, and the replace-receipt screen never goes through the code
 * that builds it. Overwriting in place reaches every reader without touching any of them, at the cost of
 * the coordination in `receiptUpgrades` and the staged swap below.
 */

/** Owns the receipts folder. The only code that writes a file there, names one, or resolves one. */
type ReceiptStorage = {
    /** Moves a file into the receipts folder and returns its durable name. Rejects when the file did not land. */
    adopt: (uriOrPath: string, fileName?: string) => Promise<string>;

    /**
     * Swaps the bytes behind an adopted receipt, keeping its durable name so the confirmation preview, the
     * upload and replace-receipt all read the new file. Rejects if the receipt is not in durable storage,
     * another swap over the same receipt is already running, or the swap fails — in every case leaving the
     * original in place.
     *
     * `shouldAbort` is consulted once more at the last moment before the receipt's own path changes. The
     * work before that point yields several times, so a reader can claim the receipt after the caller's own
     * check; asking again here means the swap backs out instead of renaming underneath a read in progress.
     * Past that point the swap is committed, and a reader arriving late waits for the renames instead.
     */
    overwrite: (durableName: string, uriOrPath: string, shouldAbort?: () => boolean) => Promise<string>;

    /** Deletes a temporary file the app is done with. Resolves even when the file is already gone. */
    discard: (uriOrPath: string) => Promise<void>;

    /**
     * Resolves a stored source to a URI that can be read right now, or `undefined` when the file is gone.
     * Also puts a receipt back when a swap was interrupted and left it under a temporary name.
     */
    locate: (source: ReceiptSource | null | undefined) => Promise<string | undefined>;

    /**
     * Claims the receipt's current bytes for a caller about to send them, and resolves once its name is
     * stable. An optional upgrade still preparing a better file gives up rather than being waited for, so
     * the only wait here is a swap already committed to its renames — two renames inside one directory.
     *
     * `locate` claims on behalf of the callers it resolves a path for; a caller that sends the file object
     * itself has to claim here directly.
     */
    settle: (durableName: string) => Promise<void>;

    /** Valid for this launch only, so never store the result. */
    toLocalUri: (durableName: string) => string;

    /** Re-roots a stored source onto the current folder. A remote source passes through unchanged. */
    resolve: (source: ReceiptSource | null | undefined) => string | undefined;
};

export default ReceiptStorage;
