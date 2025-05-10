import Onyx, {OnyxCollection} from 'react-native-onyx';
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attachment} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type FetchFileProps = {
    url?: string;
    file?: File;
};

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
    if (attachment && attachment.source) {
        if (attachment.source instanceof Blob) {
            const imageUrl = URL.createObjectURL(attachment.source);
            return imageUrl;
        } else {
            return attachment.source;
        }
    }
    return attachment?.remoteSource || currentSource;
}

function fetchFile(url?: string, file?: File): Promise<ArrayBuffer | undefined> {
    return new Promise((resolve) => {
        if (!url && !file?.uri) {
            resolve(undefined);
            return;
        }

        const isLocal = isLocalFile(file?.uri);
        const hasFileAndIsLocal = !isEmptyObject(file) && file.uri && isLocal;

        if (hasFileAndIsLocal) {
            const reader = new FileReader();

            reader.onload = (e) => {
                if (e.target && e.target.result instanceof ArrayBuffer) {
                    resolve(e.target.result);
                }
                resolve(undefined);
            };

            reader.onerror = (err) => {
                console.error('Failed to read file', err);
                resolve(undefined);
            };

            // Use array buffer for better perfomance i.e large attachment
            reader.readAsArrayBuffer(file);

            return;
        }
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
                const fileBuffer = res.arrayBuffer();
                resolve(fileBuffer);
            })
            .catch((err) => {
                console.error('Failed to fetch file', err);
                resolve(undefined);
            });
    });
}

function cacheAttachment(attachmentID: string, url: string, file?: File) {
    // TODO: Exit from the function if the image is not changed or the image has already been cached

    const attachmentUrl = url ?? file?.uri ?? '';
    fetchFile(attachmentUrl)?.then((arrayBuffer) => {
        const uint8Array = new Uint8Array(arrayBuffer ?? []);
        const fileData = new Blob([uint8Array]);
        Onyx.merge(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
            source: fileData,
        });
    });
}

export {uploadAttachment, getAttachmentSource, fetchFile, cacheAttachment};
