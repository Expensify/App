import type {FileObject} from '@components/AttachmentModal';
import type IconAsset from '@src/types/utils/IconAsset';

type AttachmentSource = string | IconAsset | number;

type Attachment = {
    /** Report action ID of the attachment */
    reportActionID?: string;

    /** Whether source url requires authentication */
    isAuthTokenRequired?: boolean;

    /** URL to full-sized attachment, SVG function, or numeric static image on native platforms */
    source: AttachmentSource;

    /** File object can be an instance of File or Object */
    file?: FileObject;

    /** Whether the attachment has been flagged */
    hasBeenFlagged?: boolean;

    /** The id of the transaction related to the attachment */
    transactionID?: string;

    isReceipt?: boolean;

    duration?: number;
};

export type {AttachmentSource, Attachment};
