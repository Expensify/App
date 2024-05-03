import * as FileUtils from '@libs/fileDownload/FileUtils';
import FileTypes from '@libs/FileTypes';
import type LocalFileCreate from './types';

/**
 * Creates a Blob file
 * @param fileName name of the file
 * @param textContent content of the file
 * @param fileType type of the file
 * @returns path, filename and size of the newly created file
 */
const localFileCreate: LocalFileCreate = (fileName, textContent, fileType = FileTypes.TEXT) => {
    const newFileName = `${FileUtils.appendTimeToFileName(fileName)}${fileType.extension}`;
    const blob = new Blob([textContent], {type: fileType.mimeType});
    const url = URL.createObjectURL(blob);

    return Promise.resolve({path: url, newFileName, size: blob.size});
};

export default localFileCreate;
