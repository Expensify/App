import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import CacheAPI from '@libs/CacheAPI';
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attachment} from '@src/types/onyx';

let attachments: OnyxCollection<Attachment>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.ATTACHMENT,
    waitForCollectionCallback: true,
    callback: (value) => (attachments = value ?? {}),
});

function cacheAttachment(attachmentID: string, uri: string) {
    fetch(uri)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to store attachment');
            }
            CacheAPI.put(CONST.CACHE_API_KEYS.ATTACHMENTS, attachmentID, response);
            Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                attachmentID,
                remoteSource: isLocalFile(uri) ? '' : uri,
            });
        })
        .catch(() => {
            throw new Error('Failed to store attachment');
        });
}

function getCachedAttachment(attachmentID: string, currentSource: string) {
    const attachment = attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`];

    if (attachment?.remoteSource && attachment.remoteSource !== currentSource) {
        cacheAttachment(attachmentID, currentSource);
        return currentSource;
    }

    return CacheAPI.get(CONST.CACHE_API_KEYS.ATTACHMENTS, attachmentID)?.then((response) => {
        if (!response) {
            throw new Error('Failed to get attachment');
        }
        return response
            .blob()
            .then((attachmentFile) => {
                const source = URL.createObjectURL(attachmentFile);
                return source;
            })
            .catch(() => {
                throw new Error('Failed to get attachment');
            });
    });
}

function removeCachedAttachment(attachmentID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, null);
    CacheAPI.remove(CONST.CACHE_API_KEYS.ATTACHMENTS, attachmentID);
}

export {cacheAttachment, getCachedAttachment, removeCachedAttachment};
