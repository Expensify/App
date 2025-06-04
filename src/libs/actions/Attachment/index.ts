import Onyx, {OnyxCollection} from 'react-native-onyx';
import CacheAPI from '@libs/CacheAPI';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attachment} from '@src/types/onyx';

let attachments: OnyxCollection<Attachment> | undefined;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.ATTACHMENT,
    waitForCollectionCallback: true,
    callback: (value) => (attachments = value),
});

function uploadAttachment(attachmentID: string, url: string) {
    if (!attachmentID || !url) {
        return;
    }
    fetch(url)?.then((response) => {
        if (!response.ok) {
            return;
        }
        CacheAPI.put('attachment', attachmentID, response);
    });
}

function getAttachmentSource(attachmentID: string, currentSource: string) {
    const attachment: Attachment | undefined = attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`];
    if (attachment && attachment.source) {
        if (typeof attachment.source !== 'string') {
            const imageUrl = URL.createObjectURL(attachment.source);
            return imageUrl;
        } else {
            return attachment.source;
        }
    }
    return attachment?.remoteSource || currentSource;
}

function fetchFile(url: string): Promise<Blob | undefined> {
    return new Promise((resolve) => {
        if (!url) {
            resolve(undefined);
            return;
        }

        fetch(url)
            .then((res) => {
                if (!res.ok) {
                    console.error('Failed to fetch file');
                    resolve(undefined);
                }
                const fileData = res.blob();
                resolve(fileData);
            })
            .catch((err) => {
                console.error('Failed to fetch file', err);
                resolve(undefined);
            });
    });
}

function cacheAttachment(attachmentID: string, url: string, file?: File) {
    const attachment: Attachment | undefined = attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`];
    const attachmentUrl = url ?? file?.uri ?? '';
    if (attachment && attachment.remoteSource === attachmentUrl && attachment.source) {
        return;
    }

    fetchFile(attachmentUrl)?.then((file) => {
        Onyx.merge(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
            source: file,
        });
    });
}

export {uploadAttachment, getAttachmentSource, fetchFile, cacheAttachment};
