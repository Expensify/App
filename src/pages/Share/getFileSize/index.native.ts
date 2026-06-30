import RNFS from 'react-native-fs';
import getNativeFileSystemPath from '@libs/fileDownload/getNativeFileSystemPath';
import type GetFileSizeType from './types';

const getFileSize: GetFileSizeType = (uri: string) => {
    // RNFS.stat uses NSFileManager.attributesOfItemAtPath: which expects a POSIX path, not a file:// URI
    return RNFS.stat(getNativeFileSystemPath(uri)).then((fileStat) => {
        return fileStat.size;
    });
};

export default getFileSize;
