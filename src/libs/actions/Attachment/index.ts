import Onyx, {OnyxCollection} from 'react-native-onyx';
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attachment} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {CacheAttachmentProps} from './types';

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

function getAttachmentSource(attachmentID: string, src: string) {
    const attachment: Attachment | undefined = attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`];
    if (attachment && Array.isArray(attachment?.localSource)) {
        const uint8Array = new Uint8Array(attachment.localSource as number[]);
        const blob = new Blob([uint8Array], {type: attachment.localSourceType});
        const imageUrl = URL.createObjectURL(blob);
        return imageUrl;
    }
    return attachment?.remoteSource || src;
}

function fetchFile({url, file}: FetchFileProps): Promise<ArrayBuffer | undefined> {
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

function cacheAttachment({attachmentID, url, file}: CacheAttachmentProps) {
    const attachment = attachments?.[attachmentID];

    // Exit from the function if the image is not changed or the image has already been cached
    // if (attachment && attachment.remoteSource === src && attachment.localSource) {
    //     return;
    // }
    const attachmentUrl = url ?? file?.uri ?? '';
    fetchFile({
        url: attachmentUrl,
    })?.then((arrayBuffer) => {
        const uint8Array = new Uint8Array(arrayBuffer ?? []);
        const plainArray = Array.from(uint8Array);
        Onyx.merge(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
            localSource: plainArray,
            localSourceType: file?.type ?? '',
        });
    });
}

export {getAttachmentSource, fetchFile, cacheAttachment};
