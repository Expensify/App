import Onyx from 'react-native-onyx';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import FileTypes from '@libs/FileTypes';
import localFileDownload from '@libs/localFileDownload';

/**
 * Export all data from Onyx to a file, then download that file.
 */
function exportOnyxDataToFile() {
    Onyx.getAllEntries()
        .then((entries) => JSON.stringify(Object.fromEntries(entries)))
        .then((json) => localFileDownload('NewExpensifyOnyxExport', json, FileTypes.JSON));
}

/**
 * Replace all Onyx data with data from a file.
 */
function importOnyxDataFromFile(filepath: string) {
    FileUtils.readFileAsync(filepath, filepath.split('//')[1], (file) => {
        let onyxData = {};
        file.text()
            .then((fileContents) => {
                onyxData = JSON.parse(fileContents);
            })
            .then(() => Onyx.clear())
            .then(() => Onyx.multiSet(onyxData));
    });
}

export default {
    exportOnyxDataToFile,
    importOnyxDataFromFile,
};
