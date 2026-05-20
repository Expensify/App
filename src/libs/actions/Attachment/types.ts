import type {OnyxEntry} from 'react-native-onyx';
import type {Attachment} from '@src/types/onyx';

type CacheAttachmentProps = {
    uri: string;
    /** Attachment ID based on the data-attachment-id attribute (only required for non-auth remote attachments) */
    attachmentID?: string;

    /** URI of the given attachment either external or local source */
    sourceHeaders?: Record<string, string>;

    /** MIME type of the given attachment (native-only) */
    fileType?: string;
};

type GetCachedAttachmentProps = {
    uri: string;
    /** Attachment ID based on the data-attachment-id attribute */
    attachmentID?: string;

    /** Attachment data from Onyx */
    attachment: OnyxEntry<Attachment>;

    /** Current source of the attachment */
    sourceHeaders?: Record<string, string>;
};

type RemoveCachedAttachmentProps = {
    /** Attachment ID based on the data-attachment-id attribute */
    attachmentID: string;

    /** Local source of the attachment (for-native-only) */
    localSource?: string;
};

export type {CacheAttachmentProps, GetCachedAttachmentProps, RemoveCachedAttachmentProps};
