/** Owns the receipts folder. The only code that writes a file there, names one, or resolves one. */
type ReceiptStorage = {
    /**
     * The only entry point. Takes a file from the camera, the gallery, the share sheet, or the cropper.
     * Returns the durable name, the only part of the location that is safe to persist. Rejects when the
     * file did not land, so no caller reads a failed move as a success.
     */
    adopt: (uriOrPath: string, fileName?: string) => Promise<string>;

    /** Builds the path for a durable name. Valid for this launch only, so never store the result. */
    toLocalUri: (durableName: string) => string;

    /**
     * Where to read a stored receipt source on this launch. Re-roots the filename inside the stored
     * path onto the current folder, so the container prefix the path carries no longer matters.
     * A remote source passes through unchanged, so an uploaded receipt never reads as a local file.
     */
    resolve: (source: unknown) => string | undefined;
};

export default ReceiptStorage;
