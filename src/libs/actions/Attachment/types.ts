type CacheAttachmentProps = {
    uri: string;
    /** Attachment ID based on the data-attachment-id attribute. Required for markdown and local file uploads; not needed for auth-protected remote attachments */
    attachmentID?: string;

    /** Auth token for protected remote attachments */
    authToken?: string;

    /** MIME type of the given attachment, used as a fallback when the URI doesn't reveal the type (native-only) */
    fileType?: string;
};

type GetCachedAttachmentProps = {
    uri: string;
    /** Attachment ID based on the data-attachment-id attribute */
    attachmentID?: string;

    /** Remote source URL for markdown attachments, used to detect source changes and re-cache */
    remoteSource?: string;

    /** Onyx-stored file path from a previous cache, used to verify the file still exists (native-only) */
    localSource?: string;

    /** Auth token for protected remote attachments */
    authToken?: string;
};

type RemoveCachedAttachmentProps = {
    /** Attachment ID based on the data-attachment-id attribute */
    attachmentID: string;

    /** Onyx-stored file path of the cached attachment (native-only) */
    localSource?: string;
};

export type {CacheAttachmentProps, GetCachedAttachmentProps, RemoveCachedAttachmentProps};
