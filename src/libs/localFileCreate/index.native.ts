import {appendTimeToFileName, splitExtensionFromFileName} from '@libs/fileDownload/FileUtils';

import RNFetchBlob from 'react-native-blob-util';

import type LocalFileCreate from './types';

/**
 * Creates a blob file using RN Fetch Blob
 * @param fileName name of the file
 * @param textContent content of the file
 * @returns path, filename and size of the newly created file
 */
const localFileCreate: LocalFileCreate = (fileName, textContent, appendTimestamp = true) => {
    const {fileExtension} = splitExtensionFromFileName(fileName);
    const fileNameWithExtension = fileExtension ? fileName : `${fileName}.txt`;
    const newFileName = appendTimestamp ? appendTimeToFileName(fileNameWithExtension) : fileNameWithExtension;
    // These files are temporary hand-offs to a share/copy flow that deletes them afterwards,
    // so they belong in the cache directory, which is never exposed to the user (unlike
    // Documents, which the iOS Files app shows when file sharing is enabled)
    const dir = RNFetchBlob.fs.dirs.CacheDir;
    const path = `${dir}/${newFileName}`;

    return RNFetchBlob.fs.writeFile(path, textContent, 'utf8').then(() => RNFetchBlob.fs.stat(path).then(({size}) => ({path, newFileName, size})));
};

export default localFileCreate;
