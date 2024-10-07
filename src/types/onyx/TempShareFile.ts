/** Model of the file shared from the external source */
type TempShareFile = {
    /** ID of the share file */
    id?: string;

    /** Path to the file copy in the app folder, or text content */
    content?: string;

    /** Mime type of the file */
    mimeType?: string;

    /** Whether to remove the file. Necessary for the offline handling */
    readyForRemoval?: boolean;

    /** ID of the report this share file is, or will be attached to */
    reportID?: string;

    /** Timestamp of when the share attempt started */
    processedAt?: string;
};

export default TempShareFile;

// {
//     contnent: 'path' | 'string'
//     mime: ''
// }
