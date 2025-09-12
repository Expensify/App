import RNFS from 'react-native-fs';
import Onyx from 'react-native-onyx';
import {getMimeType} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CacheAttachmentProps, GetCachedAttachmentProps} from './types';

function cacheAttachment({attachmentID, uri, type}: CacheAttachmentProps) {
    const isMarkdownAttachment = !uri.startsWith('file://');
    let mimeType = type;
    let isSuccess = true;

    if (!isMarkdownAttachment && mimeType) {
        const fileType = getMimeType(mimeType);
        const fileName = `${attachmentID}.${fileType}`;
        const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        RNFS.copyFile(uri, destPath)
            .then(() => {
                Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                    attachmentID,
                    source: destPath,
                });
            })
            .catch(() => {
                Log.warn('Failed to cache attachment');
            });
    }

    fetch(uri)
        .then((response) => {
            if (!response.ok) {
                isSuccess = false;
            }

            const contentType = response.headers.get('content-type');
            if (!mimeType && contentType) {
                mimeType = contentType;
            }

            return response.arrayBuffer();
        })
        .then((bufferData) => {
            if (!isSuccess) {
                return;
            }

            const fileType = getMimeType(mimeType ?? '');
            // If fileType is not set properly, then we need to exit
            if (!fileType) {
                return;
            }
            const finalData = btoa(String.fromCharCode(...new Uint8Array(bufferData)));
            const fileName = `${attachmentID}.${fileType}`;
            const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
            RNFS.writeFile(filePath, finalData, 'base64')
                .then(() => {
                    // If it's markdown attachment, then we need to set the remoteSource accordingly
                    if (isMarkdownAttachment) {
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
                })
                .catch(() => {
                    Log.warn('Failed to cache attachment');
                });
        });
}

function getCachedAttachment({attachmentID, attachment, currentSource}: GetCachedAttachmentProps) {
    if (!attachment || (attachment?.remoteSource && attachment.remoteSource !== currentSource)) {
        cacheAttachment({attachmentID, uri: currentSource});
        return Promise.resolve(currentSource);
    }
    return Promise.resolve(attachment?.source ?? currentSource);
}

function removeCachedAttachment(attachmentID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, null);
}

export {cacheAttachment, getCachedAttachment, removeCachedAttachment};
