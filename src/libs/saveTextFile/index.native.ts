import localFileCreate from '@libs/localFileCreate';

import RNFetchBlob from 'react-native-blob-util';
import Share from 'react-native-share';

import type SaveTextFile from './types';

const saveTextFile: SaveTextFile = async ({fileName, content}) => {
    const {path} = await localFileCreate(fileName, content, false);

    try {
        await Share.open({
            url: `file://${path}`,
            failOnCancel: false,
        });
    } finally {
        await RNFetchBlob.fs.unlink(path).catch(() => {
            // A leftover cache file is harmless because the operating system can reclaim it.
        });
    }
};

export default saveTextFile;
