import * as FileUtils from '@libs/fileDownload/FileUtils';
import type LocalFileCreate from './types';

/**
 * Creates a Blob file
 * @param fileName name of the file
 * @param textContent content of the file
 * @returns path, filename and size of the newly created file
 */
const localFileCreate: LocalFileCreate = (fileName, textContent) => {
    const newFileName = FileUtils.appendTimeToFileName(fileName);
    const blob = new Blob([textContent], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);

    return Promise.resolve({path: url, newFileName, size: blob.size});
};

export default localFileCreate;
