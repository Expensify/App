import RNFS from 'react-native-fs';
import type GetFileSizeType from './types';

const getFileSize: GetFileSizeType = (uri: string) => {
    return RNFS.stat(uri).then((fileStat) => {
        return fileStat.size;
    });
};

export default getFileSize;
