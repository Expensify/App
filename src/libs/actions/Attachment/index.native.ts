import RNFetchBlob from 'react-native-blob-util';
import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attachment} from '@src/types/onyx';

let attachments: OnyxCollection<Attachment>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.ATTACHMENT,
    waitForCollectionCallback: true,
    callback: (value) => (attachments = value ?? {}),
});

function cacheAttachment(attachmentID: string, uri: string) {
    if (uri.startsWith('file://')) {
        Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
            attachmentID,
            source: uri,
        });
        return;
    }

    const attachment = attachments?.[attachmentID];

    if (attachment?.source && attachment.remoteSource === uri) {
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

function getCachedAttachment(attachmentID: string, currentSource: string) {
    const attachment = attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`];

    if (attachment?.remoteSource && attachment.remoteSource !== currentSource) {
        cacheAttachment(attachmentID, currentSource);
        return currentSource;
    }
    return attachment?.source;
}

function removeCachedAttachment(attachmentID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, null);
}

export {cacheAttachment, getCachedAttachment, removeCachedAttachment};
