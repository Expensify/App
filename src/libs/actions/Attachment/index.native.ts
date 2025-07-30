import RNFetchBlob from 'react-native-blob-util';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attachment} from '@src/types/onyx';

function cacheAttachment(attachmentID: string, uri: string) {
    if (uri.startsWith('file://')) {
        Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
            attachmentID,
            source: uri,
        });
        return;
    }

    RNFetchBlob.config({fileCache: true, path: `${RNFetchBlob.fs.dirs.DocumentDir}/${attachmentID}`})
        .fetch('GET', uri)
        .then((response) => {
            const filePath = response.path();
            Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                attachmentID,
                source: `file://${filePath}`,
                remoteSource: uri,
            });
        })
        .catch(() => {
            throw new Error('Failed to store attachment');
        });
}

function getCachedAttachment(attachment: OnyxEntry<Attachment>, currentSource: string) {
    if (!attachment?.attachmentID) {
        return currentSource;
    }
    if (!attachment || (attachment?.remoteSource && attachment.remoteSource !== currentSource)) {
        cacheAttachment(attachment.attachmentID, currentSource);
        return currentSource;
    }
    return attachment?.source;
}

function removeCachedAttachment(attachmentID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, null);
}

export {cacheAttachment, getCachedAttachment, removeCachedAttachment};
