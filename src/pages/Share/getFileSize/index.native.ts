import fileURIToPath from '@libs/fileURIToPath';

import RNFS from 'react-native-fs';

import type GetFileSizeType from './types';

const getFileSize: GetFileSizeType = (uri: string) => {
    return RNFS.stat(fileURIToPath(uri)).then((fileStat) => {
        return fileStat.size;
    });
};

export default getFileSize;
