import RNFS from 'react-native-fs';
import Onyx, {OnyxCollection} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {CacheAttachmentProps} from './types';

let attachments: OnyxCollection<OnyxTypes.Attachment> | undefined;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.ATTACHMENT,
    waitForCollectionCallback: true,
    callback: (value) => (attachments = value),
});

function getAttachmentSource(attachmentID: number) {
    const attachment: OnyxTypes.Attachment | undefined = attachments?.[attachmentID];
    const localVersion = attachment?.localVersion;
    const cachedVersion = attachment?.cachedVersion;
    const remoteVersion = attachment?.remoteVersion;
    if (attachment?.localSource && localVersion === remoteVersion) {
        return attachment?.localSource;
    }
    if (attachment?.cachedSource && cachedVersion === remoteVersion) {
        return attachment?.localSource;
    }
    return attachment?.source;
}

function cacheAttachment({attachmentID, src, fileName}: CacheAttachmentProps) {
    const attachment = attachments?.[attachmentID];
    // Exit from the function if the cachedSource is exist and the img version is same to remote source version
    if (attachment?.cachedSource && attachment.cachedVersion === attachment.remoteVersion) {
        return;
    }
    fetch(src)
        .then((response) => response.blob())
        .then((blob) => {
            const fileUrl = URL.createObjectURL(blob);
            const finalFileName = fileName ? fileName : `${attachmentID}.${blob.type}`;
            const cachePath = `file://${RNFS.PicturesDirectoryPath}/${finalFileName}`;
            RNFS.exists(cachePath).then((isExists) => {
                if (isExists) {
                    // If the cache file path is exist, remove it and create new one
                    RNFS.unlink(cachePath).then(() => {
                        RNFS.writeFile(cachePath, fileUrl);
                    });
                } else {
                    RNFS.writeFile(cachePath, fileUrl);
                }
                Onyx.merge(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                    cachedSource: fileUrl,
                    cachedVersion: attachment?.remoteVersion,
                });
            });
        });
}

export {getAttachmentSource, cacheAttachment};
