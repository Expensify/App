import {appendTimeToFileName, getMimeType, splitExtensionFromFileName} from '@libs/fileDownload/FileUtils';
import type LocalFileCreate from './types';

/**
 * Creates a Blob file
 * @param fileName name of the file
 * @param textContent content of the file
 * @returns path, filename and size of the newly created file
 */
const localFileCreate: LocalFileCreate = (fileName, textContent) => {
    const {fileExtension} = splitExtensionFromFileName(fileName);
    const fileNameWithExtension = fileExtension ? fileName : `${fileName}.txt`;
    const newFileName = appendTimeToFileName(fileNameWithExtension);
    const blob = new Blob([textContent], {type: getMimeType(fileExtension)});
    const url = URL.createObjectURL(blob);

    return Promise.resolve({path: url, newFileName, size: blob.size});
};

export default localFileCreate;
