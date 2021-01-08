/**
 * rn-fetch-blob only supports file downloads for native platforms. This library allows file downloads
 * on web and desktop platforms using js fetch API.
 * Downloaded file will be named as download.ext
 * If fetch API fails to download file for any reason then sourceURL will be opened in new tab.
 * Known reasons for fetch failure:
 * 1. Fetch from localhost origin is blocked by CORS policy on Chrome browser.
 */

import openURLInNewTab from '../openURLInNewTab';
import getFileExtensionFromURL from './helper';

/**
 * @param {String} sourceURL
 */

const downloadUrlFile = (sourceURL) => {
    if (!sourceURL) { return null; }

    // get file extension from sourceURL
    const fileExtension = getFileExtensionFromURL(sourceURL);
    if (!fileExtension) { return null; }

    fetch(sourceURL).then(response => response.blob().then((blob) => {
        // create an anchor (a) node to download blob
        const link = document.createElement('a');
        link.id = 'tempDownloadLink'; // set id of download link
        link.href = URL.createObjectURL(blob); // set href of download link

        // set file name as download attribute of download link
        link.setAttribute('download', `download.${fileExtension}`);
        link.click();
        link.remove();
    })).catch(() => {
        // file could not be downloaded, open sourceURL in new tab
        openURLInNewTab(sourceURL);
    });
};

export default downloadUrlFile;
