import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TempShareFile} from '@src/types/onyx';

// const allTempShareFiles: OnyxCollection<TempShareFile> = {};
// Onyx.connect({
//     key: ONYXKEYS.COLLECTION.TEMP_SHARE_FILES,
//     waitForCollectionCallback: true,
//     callback: (value) => {
//         if (!value) {
//             return;
//         }
//         allTempShareFiles = Object.fromEntries(Object.entries(value).filter(([, shareFiles]) => !!shareFiles));
//     },
// });

function addTempShareFile(file: TempShareFile) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TEMP_SHARE_FILES}${file.id}`, file);
}

function markTempShareFileUploaded(fileID: string, reportID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TEMP_SHARE_FILES}${fileID}`, {readyForRemoval: true});
}

export {addTempShareFile, markTempShareFileUploaded};
