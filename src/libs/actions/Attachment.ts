import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function cacheAttachment(src: string, attachmentID: string) {
    fetch(src)
        .then((response) => response.blob())
        .then((blob) => {
            const url = URL.createObjectURL(blob);

            Onyx.merge(`${ONYXKEYS.COLLECTION.ATTACHMENT}${attachmentID}`, {
                attachmentID,
                cachedSource: url,
            });
        });
}

export {cacheAttachment};
