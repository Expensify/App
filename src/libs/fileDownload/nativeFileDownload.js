import RNFetchBlob from 'rn-fetch-blob';
import RNCameraRoll from 'react-native-cameraroll';
import getPlatform from '../getPlatform';

function downloadImage(fileUrl) {
    return RNCameraRoll.CameraRoll.save(fileUrl);
}

function downloadVideo(fileUrl) {
    return RNCameraRoll.CameraRoll.save(fileUrl);
}

function downloadDocument(fileUrl, fileName) {
    const dirs = RNFetchBlob.fs.dirs;

    // android files will download to Download directory
    // ios files will download to documents directory
    const path = getPlatform() === 'android' ? dirs.DownloadDir : dirs.DocumentDir;

    // fetching the attachment
    const fetchedAttachment = RNFetchBlob.config({
        fileCache: true,
        path: `${path}/${fileName}`,
        addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            path: `${path}/Expensify/${fileName}`,
        },
    }).fetch('GET', fileUrl);
    return fetchedAttachment;
}

function handleFileDownload(fileUrl, fileName) {
    const fileType = 'image'; // getFileType(fileUrl);
    switch (fileType) {
        case 'image':
            return downloadImage(fileUrl, fileName);
        case 'video':
            return downloadVideo(fileUrl, fileName);
        default:
            return downloadDocument(fileUrl, fileName);
    }
}

export default handleFileDownload;
