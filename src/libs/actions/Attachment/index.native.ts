import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import Onyx from 'react-native-onyx';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {isLocalAttachment} from '@libs/AttachmentUtils';
import {getFileExtension} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CacheAttachmentProps, GetCachedAttachmentProps, RemoveCachedAttachmentProps} from './types';

function cacheAttachment({attachmentID, uri, mimeType}: CacheAttachmentProps) {
    const isMarkdownAttachment = !uri.startsWith('file://');
    const attachmentURL = isLocalAttachment(uri) ? addEncryptedAuthTokenToURL(tryResolveUrlFromApiRoot(uri)) : uri;
    let fileType = getFileExtension(mimeType ?? '');

    // If it's coming from direct attachment file upload, we can just simply copy the file instead of fetching it again
    if (!isMarkdownAttachment && fileType) {
        const fileName = `${attachmentID}.${fileType}`;
        const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        return RNFS.copyFile(uri, destPath)
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

    return fetch(attachmentURL, {
        method: 'HEAD',
    }).then((response) => {
        const contentType = response.headers.get('Content-Type');
        const contentLength = response.headers.get('Content-Length');
        const contentSize = contentLength ? Number(contentLength) : 0;

        // Exit if the markdown attachment size is too large
        if (isMarkdownAttachment && contentSize > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
            return;
        }

        if (!fileType && contentType) {
            fileType = getFileExtension(contentType);
        }

        // If fileType is not set properly, then we need to exit
        if (!fileType) {
            return;
        }

        const fileName = `${attachmentID}.${fileType}`;
        const filePath = `${RNFetchBlob.fs.dirs.DocumentDir}/${fileName}`;

        RNFetchBlob.config({
            path: filePath,
        })
            .fetch('GET', attachmentURL)
            .then((attachment) => {
                const savedPath = attachment.path();
                if (isMarkdownAttachment) {
                    Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                        attachmentID,
                        source: savedPath,
                        remoteSource: uri,
                    });
                    return;
                }
                Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                    attachmentID,
                    source: savedPath,
                });
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

function removeCachedAttachment({attachmentID, localSource}: RemoveCachedAttachmentProps) {
    if (!localSource) {
        return;
    }
    RNFS.exists(localSource).then((exists) => {
        if (!exists) {
            Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, null);
            return;
        }
        RNFS.unlink(localSource)
            .then(() => {
                Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, null);
            })
            .catch(() => {
                Log.warn('Failed to remove cached attachment');
            });
    });
}

function clearCachedAttachments() {
    RNFS.unlink(RNFS.DocumentDirectoryPath) // TODO: Improve this to only clear the attachments directory
        .then(() => {
            Onyx.setCollection(ONYXKEYS.COLLECTION.ATTACHMENT, {});
        })
        .catch(() => {
            Log.warn('Failed to clear cached attachments');
        });
}

export {cacheAttachment, getCachedAttachment, removeCachedAttachment, clearCachedAttachments};
