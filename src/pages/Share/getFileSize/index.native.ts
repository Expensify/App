import RNFS from 'react-native-fs';
import type GetFileSizeType from './types';

const getFileSize: GetFileSizeType = (uri: string) => {
    // Decode URI if it's URL-encoded (handles special characters in filenames)
    let path = uri;
    try {
        path = decodeURI(uri);
    } catch (e) {
        path = uri;
    }

    // RNFS.stat uses NSFileManager.attributesOfItemAtPath: which expects a POSIX path, not a file:// URI
    if (path.startsWith('file://')) {
        path = path.slice(7);
    }

    return RNFS.stat(path).then((fileStat) => {
        return fileStat.size;
    });
};

export default getFileSize;
