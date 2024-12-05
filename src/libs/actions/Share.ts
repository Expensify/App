import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TempShareFile} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

function clearShareData() {
    Onyx.multiSet({
        [ONYXKEYS.TEMP_SHARE_FILE]: null,
        [ONYXKEYS.SHARE_UNKNOWN_USER_DETAILS]: null,
    });
}

function addTempShareFile(file: TempShareFile) {
    Onyx.merge(ONYXKEYS.TEMP_SHARE_FILE, file);
}

function saveUnknownUserDetails(user: Participant) {
    Onyx.merge(ONYXKEYS.SHARE_UNKNOWN_USER_DETAILS, user);
}

export {addTempShareFile, saveUnknownUserDetails, clearShareData};
