import Onyx, {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attachment} from '@src/types/onyx';
import {CacheAttachmentProps} from './types';

let attachments: OnyxCollection<Attachment> | undefined;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.ATTACHMENT,
    waitForCollectionCallback: true,
    callback: (value) => (attachments = value),
});

function getAttachmentSource(attachmentID: string, src: string) {
    const attachment: Attachment | undefined = attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`];
    return attachment?.localSource;
}

function cacheAttachment({attachmentID, src}: CacheAttachmentProps) {
    const attachment = attachments?.[attachmentID];
    // Exit from the function if the image is not changed or the image has already been cached
    if (attachment && attachment.remoteSource === src && attachment.localSource) {
        return;
    }
    fetch(src)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
            // Convert ArrayBuffer to Uint8Array for proper serialization
            const arrayBufferView = new Uint8Array(arrayBuffer);

            // Store the array buffer and mime type directly in Onyx/IndexedDB
            Onyx.merge(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                localSource: arrayBufferView,
            });
        });
}

export {getAttachmentSource, cacheAttachment};
