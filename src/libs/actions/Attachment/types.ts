import type {OnyxEntry} from 'react-native-onyx';
import type {Attachment} from '@src/types/onyx';

type CacheAttachmentProps = {
    /** Attachment ID based on the data-attachment-id attribute */
    attachmentID: string;

    /** URI of the given attachment either external or local source */
    uri: string;

    /** MIME type of the given attachment (native-only) */
    mimeType?: string;
};

type GetCachedAttachmentProps = {
    /** Attachment ID based on the data-attachment-id attribute */
    attachmentID: string;

    /** Attachment data from Onyx */
    attachment: OnyxEntry<Attachment>;

    /** Current source of the attachment */
    currentSource: string;
};

export type {CacheAttachmentProps, GetCachedAttachmentProps};
