import type {FileObject} from '@components/AttachmentModal';
import type IconAsset from '@src/types/utils/IconAsset';

type AttachmentSource = string | IconAsset | number;

type Attachment = {
    /** Report action ID of the attachment */
    reportActionID?: string;

    /** The attachment id, which is the concatenation of the report action id it is in and its order index within that report action. */
    attachmentID?: string;

    /** Whether source url requires authentication */
    isAuthTokenRequired?: boolean;

    /** URL to full-sized attachment, SVG function, or numeric static image on native platforms */
    source: AttachmentSource;

    /** URL to preview-sized attachment that is also used for the thumbnail */
    previewSource?: AttachmentSource;

    /** File object can be an instance of File or Object */
    file?: FileObject;

    /** Whether the attachment has been flagged */
    hasBeenFlagged?: boolean;

    /** The id of the transaction related to the attachment */
    transactionID?: string;

    isReceipt?: boolean;

    duration?: number;

    attachmentLink?: string;
};

export type {AttachmentSource, Attachment};
