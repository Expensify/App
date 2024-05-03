import FileTypes from '@libs/FileTypes';
import localFileCreate from '@libs/localFileCreate';
import type LocalFileDownload from './types';

/**
 * Creates a Blob with the given fileName and textContent, then dynamically
 * creates a temporary anchor, just to programmatically click it, so the file
 * is downloaded by the browser.
 */
const localFileDownload: LocalFileDownload = (fileName, textContent, fileType = FileTypes.TEXT) => {
    localFileCreate(`${fileName}${fileType.extension}`, textContent).then(({path, newFileName}) => {
        const link = document.createElement('a');
        link.download = newFileName;
        link.href = path;
        link.click();
    });
};

export default localFileDownload;
