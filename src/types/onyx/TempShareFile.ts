/** Model of the file shared from the external source */
type TempShareFile = {
    /** Path to the file copy in the app folder */
    path?: string;

    /** Mime type of the file */
    mimeType?: string;

    /** Whether to remove the file. Necessary for the offline handling */
    readyForRemoval?: boolean;
};

export default TempShareFile;

// {
//     contnent: 'path' | 'string'
//     mime: ''
// }
