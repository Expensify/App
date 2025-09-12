import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import CacheAPI from '@libs/CacheAPI';
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attachment} from '@src/types/onyx';
import {CacheAttachmentProps} from './types';

function cacheAttachment({attachmentID, uri}: CacheAttachmentProps) {
    fetch(uri)
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
                .catch((error) => {
                    Log.warn('Failed to cache attachment', error);
                });
        })
        .catch(() => {
            return;
        });
}

function getCachedAttachment(attachmentID: string, attachment: OnyxEntry<Attachment>, currentSource: string) {
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

function removeCachedAttachment(attachmentID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, null);
    CacheAPI.remove(CONST.CACHE_API_KEYS.ATTACHMENTS, attachmentID);
}

export {cacheAttachment, getCachedAttachment, removeCachedAttachment};
