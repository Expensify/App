import localFileCreate from '@libs/localFileCreate';

import RNFS from 'react-native-fs';
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
        await RNFS.unlink(path).catch(() => {});
    }
};

export default saveTextFile;
