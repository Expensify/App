type AttachmentFile = {
    name: string;
};

type AttachmentSource = string | (() => void) | number;

type Attachment = {
    /** Whether source url requires authentication */
    isAuthTokenRequired?: boolean;

    /** URL to full-sized attachment, SVG function, or numeric static image on native platforms */
    source: AttachmentSource;

    /** File object can be an instance of File or Object */
    file: AttachmentFile;
};

type AttachmentsProps = Attachment[];

export type {AttachmentSource, AttachmentFile, Attachment, AttachmentsProps};
