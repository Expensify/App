import Onyx from 'react-native-onyx';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {isLocalAttachment} from '@libs/AttachmentUtils';
import CacheAPI from '@libs/CacheAPI';
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CacheAttachmentProps, GetCachedAttachmentProps, RemoveCachedAttachmentProps} from './types';

function cacheAttachment({attachmentID, uri}: CacheAttachmentProps) {
    const attachmentURL = isLocalAttachment(uri) ? addEncryptedAuthTokenToURL(tryResolveUrlFromApiRoot(uri)) : uri;

    return fetch(attachmentURL)
        .then((response) => {
            if (!response.ok) {
                return;
            }
            CacheAPI.put(CONST.CACHE_API_KEYS.ATTACHMENTS, attachmentID, response)
                .then(() => {
                    Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                        attachmentID,
                        remoteSource: isLocalFile(uri) ? '' : uri,
                    });
                })
                .catch(() => {
                    Log.warn('Failed to cache attachment');
                });
        })
        .catch(() => {
            Log.warn('Failed to fetch attachment');
        });
}

function getCachedAttachment({attachmentID, attachment, currentSource}: GetCachedAttachmentProps) {
    if (!attachment || (attachment?.remoteSource && attachment.remoteSource !== currentSource)) {
        cacheAttachment({attachmentID, uri: currentSource});
        return Promise.resolve(currentSource);
    }

    return CacheAPI.get(CONST.CACHE_API_KEYS.ATTACHMENTS, attachment.attachmentID)?.then((response) => {
        return response
            ?.blob()
            .then((attachmentFile) => {
                const source = URL.createObjectURL(attachmentFile);
                return source;
            })
            .catch(() => {
                Log.warn('Failed to get attachment');
            });
    });
}

function removeCachedAttachment({attachmentID}: RemoveCachedAttachmentProps) {
    CacheAPI.remove(CONST.CACHE_API_KEYS.ATTACHMENTS, attachmentID)
        .then(() => {
            Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, null);
        })
        .catch(() => {
            Log.warn('Failed to remove cached attachment');
        });
}

function clearCachedAttachments() {
    CacheAPI.clear(CONST.CACHE_API_KEYS.ATTACHMENTS)
        .then(() => {
            Onyx.setCollection(ONYXKEYS.COLLECTION.ATTACHMENT, {});
        })
        .catch(() => {
            Log.warn('Failed to clear cached attachments');
        });
}

export {cacheAttachment, getCachedAttachment, removeCachedAttachment, clearCachedAttachments};
