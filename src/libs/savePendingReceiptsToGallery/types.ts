/** A pending, locally-stored receipt awaiting upload, reduced to what the gallery save needs. */
type PendingReceipt = {
    /** Local file path, from `receipt.localSource ?? receipt.source`, only when it passes `isLocalFile()` */
    localPath: string;

    /** Original receipt file name, when available */
    filename?: string;

    /** Receipt MIME type, when available */
    type?: string;
};

/** Outcome of a batch gallery save. */
type SaveReceiptsResult = {
    /** Number of receipts written to the gallery */
    savedCount: number;

    /** Number of receipts that failed to write */
    failedCount: number;

    /** True when the batch could not save because the OS denied gallery/photo-library access, so the caller can surface a permission prompt. */
    permissionDenied: boolean;
};

export type {PendingReceipt, SaveReceiptsResult};
