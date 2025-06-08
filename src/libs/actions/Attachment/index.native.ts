import RNFetchBlob from 'react-native-blob-util';
import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attachment} from '@src/types/onyx';

let attachments: OnyxCollection<Attachment> | undefined;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.ATTACHMENT,
    waitForCollectionCallback: true,
    callback: (value) => (attachments = value ?? {}),
});

function storeAttachment(attachmentID: string, uri: string) {
    if (!attachmentID || !uri) {
        return;
    }
    if (uri.startsWith('file://')) {
        console.log(`attachment_${attachmentID}`, {
            attachmentID,
            source: uri,
        });
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
            console.log(`markdown_link_attachment_${attachmentID}`, {
                attachmentID,
                source: filePath,
            });
            Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                attachmentID,
                source: `file://${filePath}`,
                remoteSource: uri,
            });
        })
        .catch((error) => {
            console.error(error);
            throw new Error('Failed to store attachment');
        });
}

function getAttachmentSource(attachmentID: string, currentSource: string) {
    if (!attachmentID) {
        return;
    }
    const attachment = attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`];

    if (attachment?.remoteSource && attachment.remoteSource !== currentSource) {
        storeAttachment(attachmentID, currentSource);
        return currentSource;
    }
    return attachment?.source;
}

function deleteAttachment(attachmentID: string) {
    if (!attachmentID) {
        return;
    }
    Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, null);
}

export {storeAttachment, getAttachmentSource, deleteAttachment};
