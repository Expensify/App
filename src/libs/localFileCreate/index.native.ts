import RNFetchBlob from 'react-native-blob-util';
import * as FileUtils from '@libs/fileDownload/FileUtils';

/**
 * Creates a blob file using RN Fetch Blob
 * @param fileName name of the file
 * @param textContent content of the file
 * @returns path and filename of the newly created file
 */
const localFileCreate = (fileName: string, textContent: string) => {
    const newFileName = FileUtils.appendTimeToFileName(fileName);
    const dir = RNFetchBlob.fs.dirs.DocumentDir;
    const path = `${dir}/${newFileName}.txt`;

    return RNFetchBlob.fs.writeFile(path, textContent, 'utf8').then(() => ({path, newFileName}));
};

export default localFileCreate;
