import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ShareTempFile} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {FileObject} from '@src/types/utils/Attachment';

/**
Function for clearing old saved data before at the start of share-extension flow
 */
function clearShareData() {
    Onyx.multiSet({
        [ONYXKEYS.SHARE_TEMP_FILE]: null,
        [ONYXKEYS.SHARE_UNKNOWN_USER_DETAILS]: null,
    });
}

/**
Function storing natively shared file's properties for processing across share-extension screens

function addTempShareFile(file: ShareTempFile) {
 * @param file shared file's object with additional props
 */
function addTempShareFile(file: ShareTempFile) {
    Onyx.merge(ONYXKEYS.SHARE_TEMP_FILE, file);
}

/**
 * Stores a previously validated file object in Onyx for further use.
 *
 * @param file Array of validated file objects to be saved
 */
function addValidatedShareFile(file: FileObject[]) {
    Onyx.set(ONYXKEYS.VALIDATED_FILE_OBJECT, file.at(0));
}

/**
Function storing selected user's details for the duration of share-extension flow, if account doesn't exist

 * @param user selected user's details
 */
function saveUnknownUserDetails(user: Participant) {
    Onyx.merge(ONYXKEYS.SHARE_UNKNOWN_USER_DETAILS, user);
}

/**
 * Function to clear the unknown user details
 */
function clearUnknownUserDetails() {
    Onyx.merge(ONYXKEYS.SHARE_UNKNOWN_USER_DETAILS, null);
}

export {addTempShareFile, saveUnknownUserDetails, clearShareData, addValidatedShareFile, clearUnknownUserDetails};
