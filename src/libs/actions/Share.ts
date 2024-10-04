import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TempShareFile} from '@src/types/onyx';

function addTempShareFile(file: TempShareFile) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TEMP_SHARE_FILES}${file.path}`, file);
}

function markTempShareFileUploaded(filePath: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TEMP_SHARE_FILES}${filePath}`, {readyForRemoval: true});
}

export {addTempShareFile, markTempShareFileUploaded};
