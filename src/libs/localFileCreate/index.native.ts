import RNFetchBlob from 'react-native-blob-util';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import type LocalFileCreate from './types';

/**
 * Creates a blob file using RN Fetch Blob
 * @param fileName name of the file
 * @param textContent content of the file
 * @returns path, filename and size of the newly created file
 */
const localFileCreate: LocalFileCreate = (fileName, textContent) => {
    const newFileName = FileUtils.appendTimeToFileName(fileName);
    const dir = RNFetchBlob.fs.dirs.DocumentDir;
    const path = `${dir}/${newFileName}.txt`;

    return RNFetchBlob.fs.writeFile(path, textContent, 'utf8').then(() => RNFetchBlob.fs.stat(path).then(({size}) => ({path, newFileName, size})));
};

export default localFileCreate;
