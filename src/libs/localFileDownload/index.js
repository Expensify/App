import * as FileUtils from '../fileDownload/FileUtils';

/**
 * Creates a Blob with the given fileName and textContent, then dynamically
 * creates a temporary anchor, just to programmatically click it, so the file
 * is downloaded by the browser.
 *
 * @param {String} fileName
 * @param {String} textContent
 */
export default function localFileDownload(fileName, textContent) {
    const blob = new Blob([textContent], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = FileUtils.appendTimeToFileName(`${fileName}.txt`);
    link.href = url;
    link.click();
}
