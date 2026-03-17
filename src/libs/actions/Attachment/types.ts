import type {ImageSource} from 'expo-image';
import type {OnyxEntry} from 'react-native-onyx';
import type {Attachment} from '@src/types/onyx';

type CacheAttachmentProps = {
    /** Attachment ID based on the data-attachment-id attribute (only required for non-auth remote attachments) */
    attachmentID?: string;

    /** URI of the given attachment either external or local source */
    source: ImageSource;

    /** MIME type of the given attachment (native-only) */
    mimeType?: string;
};

type GetCachedAttachmentProps = {
    /** Attachment ID based on the data-attachment-id attribute */
    attachmentID?: string;

    /** Attachment data from Onyx */
    attachment: OnyxEntry<Attachment>;

    /** Current source of the attachment */
    source: ImageSource | undefined;
};

type RemoveCachedAttachmentProps = {
    /** Attachment ID based on the data-attachment-id attribute */
    attachmentID: string;

    /** Local source of the attachment (for-native-only) */
    localSource?: string;
};

export type {CacheAttachmentProps, GetCachedAttachmentProps, RemoveCachedAttachmentProps};
