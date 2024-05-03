import Onyx from 'react-native-onyx';
import FileTypes from '@libs/FileTypes';
import localFileDownload from '@libs/localFileDownload';

/**
 * Export all data from Onyx to a file, then download that file.
 */
function exportOnyxDataToFile() {
    Onyx.getAllEntries()
        .then((entries) => JSON.stringify(entries))
        .then((json) => localFileDownload('NewExpensifyOnyxExport', json, FileTypes.JSON));
}

export default {
    exportOnyxDataToFile,
};
