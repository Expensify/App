/** Model of the file shared from the external source */
type ShareTempFile = {
    /** ID of the share file */
    id: string;

    /** Path to the file copy in the app folder, or text content */
    content: string;

    /** Mime type of the file */
    mimeType?: string;

    /** ID of the report this share file is, or will be attached to */
    reportID?: string;

    /** Timestamp of when the share attempt started */
    processedAt?: string;

    /** Aspect ratio of the image */
    aspectRatio?: number;
};

export default ShareTempFile;
