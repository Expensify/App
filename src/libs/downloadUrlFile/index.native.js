/**
 * rn-fetch-blob is used to download file at given sourceURL in the download folder of device.
 * Downloaded file will be named as download.ext
 */

import RNFetchBlob from 'rn-fetch-blob';
import getFileExtensionFromURL from './helper';

/**
 * @param {String} sourceURL
 */

const downloadUrlFile = (sourceURL) => {
    if (!sourceURL) { return null; }

    // get file extension from sourceURL
    const fileExtension = getFileExtensionFromURL(sourceURL);
    if (!fileExtension) { return null; }

    const dirs = RNFetchBlob.fs.dirs;
    RNFetchBlob.config({
        // fileCache: true,
        cacheImage: true,
        appendExt: fileExtension,

        // set file download config for android
        addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            mediaScannable: true,
            title: `download.${fileExtension}`,
            path: `${dirs.DownloadDir}/download.${fileExtension}`,
        },

        path: `${dirs.DownloadDir}/download.${fileExtension}`,
    }).fetch('GET', sourceURL, {}).then(() => {
        // console.log('File saved to ', response.path());
    }).catch(() => {
        // console.log('File Download error', error);
    });
};

export default downloadUrlFile;
