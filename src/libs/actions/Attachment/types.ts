type CacheAttachmentProps = {
    /** Attachment ID based on the data-attachment-id attribute */
    attachmentID: string;

    /** URI of the given attachment either external or local source */
    uri: string;

    /** File type of the given attachment (native-only) */
    type?: string;
};

export type {CacheAttachmentProps};
