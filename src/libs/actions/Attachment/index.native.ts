import RNFS from 'react-native-fs';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {getMimeType} from '@libs/fileDownload/FileUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attachment} from '@src/types/onyx';

function cacheAttachment(attachmentID: string, uri: string, type?: string) {
    const isMarkdownAttachemnt = !uri.startsWith('file://');
    let mimeType = type;
    fetch(uri)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to store attachment');
            }

            const contentType = response.headers.get('content-type');
            if (!mimeType && contentType) {
                mimeType = contentType;
            }

            return response.arrayBuffer();
        })
        .then((bufferData) => {
            // If mimeType is not set properly, then we need to exit
            if (!mimeType) {
                return;
            }
            const fileType = getMimeType(mimeType);
            const finalData = btoa(String.fromCharCode(...new Uint8Array(bufferData)));
            const fileName = `${attachmentID}.${fileType}`;
            const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
            RNFS.writeFile(filePath, finalData, 'base64').then(() => {
                // If it's markdown attachment, then we need to set the remoteSource accordingly
                if (isMarkdownAttachemnt) {
                    Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                        attachmentID,
                        source: filePath,
                        remoteSource: uri,
                    });
                    return;
                }
                Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                    attachmentID,
                    source: filePath,
                });
            });
        });
}

function getCachedAttachment(attachmentID: string, attachment: OnyxEntry<Attachment>, currentSource: string) {
    if (!attachment || (attachment?.remoteSource && attachment.remoteSource !== currentSource)) {
        cacheAttachment(attachmentID, currentSource);
        return Promise.resolve(currentSource);
    }
    return Promise.resolve(attachment?.source ?? currentSource);
}

function removeCachedAttachment(attachmentID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, null);
}

export {cacheAttachment, getCachedAttachment, removeCachedAttachment};
