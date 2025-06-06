import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import Onyx, {OnyxCollection} from 'react-native-onyx';
import {FileObject} from '@components/AttachmentModal';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attachment} from '@src/types/onyx';

let attachments: OnyxCollection<Attachment> | undefined;
let isAttachmentLoaded = false;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.ATTACHMENT,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            return;
        }
        attachments = value;
    },
});

function storeAttachment(attachmentID: string, uri: string) {
    if (!attachmentID || !uri) {
        console.log('leeh2');
        return;
    }

    if (uri.startsWith('file://')) {
        console.log('leeh44');
        Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
            attachmentID,
            source: uri,
        });
        return;
    }

    const attachment = attachments?.[attachmentID];

    if (attachment?.source && attachment.remoteSource === uri) {
        console.log('leeh');
        return;
    }

    RNFetchBlob.config({fileCache: true})
        .fetch('GET', uri)
        .then((response) => {
            const filePath = response.path();
            console.log('filePath', filePath);
            Onyx.set(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                attachmentID,
                source: `file://${filePath}`,
            });
        })
        .catch((error) => {
            console.log('error', error);
        });
}

function getAttachmentSource(attachmentID: string) {
    if (!attachmentID) {
        return;
    }
    const attachment = attachments?.[`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`];
    return attachment?.source;
}

export {storeAttachment, getAttachmentSource};
