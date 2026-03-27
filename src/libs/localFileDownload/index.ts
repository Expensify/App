import {showSuccessAlert} from '@libs/fileDownload/FileUtils';
import localFileCreate from '@libs/localFileCreate';
import type LocalFileDownload from './types';

/**
 * Creates a Blob with the given fileName and textContent, then dynamically
 * creates a temporary anchor, just to programmatically click it, so the file
 * is downloaded by the browser.
 */
const localFileDownload: LocalFileDownload = (fileName, textContent, translate, successMessage, shouldShowSuccessAlert) => {
    localFileCreate(fileName, textContent).then(({path, newFileName}) => {
        const link = document.createElement('a');
        link.download = newFileName;
        link.href = path;
        link.click();
        if (shouldShowSuccessAlert) {
            showSuccessAlert(translate, successMessage);
        }
    });
};

export default localFileDownload;
