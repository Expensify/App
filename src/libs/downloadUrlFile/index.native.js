/**
 * rn-fetch-blob is used to download file at given sourceURL in the download folder of device.
 * Downloaded file will be named as download.ext
 */

import RNFetchBlob from 'rn-fetch-blob';
import getFileExtensionFromURL from './helper';
import checkStoragePermission from './checkStoragePermission';

/**
 * @param {String} sourceURL
 */

const downloadUrlFile = async (sourceURL) => {
    if (!sourceURL) { return null; }

    const permission = await checkStoragePermission();
    if (permission) {
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

            path: `${dirs.DocumentDir}/download.${fileExtension}`,
        }).fetch('GET', sourceURL, {}).then(() => {
            // console.log('File saved to ', response.path());
        }).catch(() => {
            // console.log('File Download error', error);
        });
    } else {
        alert('The permission is denied to save attachment. Kindly grant permssion from settings.');
    }
};

export default downloadUrlFile;
