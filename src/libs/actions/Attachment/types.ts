import type {Attachment} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type CacheAttachmentProps = {
    uri: string;
    /** Attachment ID based on the data-attachment-id attribute (only required for non-auth remote attachments) */
    attachmentID?: string;

    /** Auth token for remote local attachments */
    authToken?: string;

    /** MIME type of the given attachment (native-only) */
    fileType?: string;
};

type GetCachedAttachmentProps = {
    uri: string;
    /** Attachment ID based on the data-attachment-id attribute */
    attachmentID?: string;

    /** Remote source */
    remoteSource?: string;

    /** Local path source for the cached attachment */
    localSource?: string;

    /** Auth token for remote local attachments */
    authToken?: string;
};

type RemoveCachedAttachmentProps = {
    /** Attachment ID based on the data-attachment-id attribute */
    attachmentID: string;

    /** Local source of the attachment (for-native-only) */
    localSource?: string;
};

export type {CacheAttachmentProps, GetCachedAttachmentProps, RemoveCachedAttachmentProps};
