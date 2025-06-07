import Onyx, {OnyxCollection} from 'react-native-onyx';
import CacheAPI from '@libs/CacheAPI';
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attachment} from '@src/types/onyx';

let attachments: OnyxCollection<Attachment> | undefined;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.ATTACHMENT,
    waitForCollectionCallback: true,
    callback: (value) => (attachments = value ?? {}),
});

function storeAttachment(attachmentID: string, uri: string) {
    if (!attachmentID || !uri) {
        return;
    }
    fetch(uri)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to store attachment');
            }
            CacheAPI.put('attachments', attachmentID, response);
            Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                attachmentID,
                remoteSource: isLocalFile(uri) ? '' : uri,
            });
        })
        .catch((error) => {
            console.error(error);
            throw new Error('Failed to store attachment');
        });
}

function getAttachmentSource(attachmentID: string, currentSource: string) {
    if (!attachmentID) {
        return;
    }
    const attachment = attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`];

    if (attachment?.remoteSource && attachment.remoteSource !== currentSource) {
        storeAttachment(attachmentID, currentSource);
        return currentSource;
    }

    return CacheAPI.get('attachments', attachmentID)?.then((response) => {
        if (!response) {
            throw new Error('Failed to get attachment');
        }
        return response
            .blob()
            .then((attachment) => {
                const source = URL.createObjectURL(attachment);
                return source;
            })
            .catch((error) => {
                console.error(error);
                throw new Error('Failed to get attachment');
            });
    });
}

export {storeAttachment, getAttachmentSource};
