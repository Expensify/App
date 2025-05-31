import Onyx, {OnyxCollection} from 'react-native-onyx';
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attachment} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

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
    Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
        source: url,
    });
}

function getAttachmentSource(attachmentID: string, currentSource: string) {
    const attachment: Attachment | undefined = attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`];
    console.log('get attachment souce');
    if (attachment && attachment.source) {
        if (typeof attachment.source !== 'string') {
            console.log('get attachment souce blob');
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

export {uploadAttachment, fetchFile, getAttachmentSource, cacheAttachment};
