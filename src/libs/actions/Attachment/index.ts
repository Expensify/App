import Onyx, {OnyxCollection} from 'react-native-onyx';
import {FileObject} from '@components/AttachmentModal';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attachment} from '@src/types/onyx';

let attachments: OnyxCollection<Attachment> | undefined;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.ATTACHMENT,
    waitForCollectionCallback: true,
    callback: (value) => (attachments = value),
});

function storeAttachment(attachmentID: string, uri: string) {}

function getAttachmentSource(attachmentID: string) {
    return '';
}

export {storeAttachment, getAttachmentSource};
