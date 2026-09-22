import RNFS from 'react-native-fs';
import Share from 'react-native-share';

import type SaveTextFile from './types';

const saveTextFile: SaveTextFile = async ({fileName, content}) => {
    const path = `${RNFS.CachesDirectoryPath}/${fileName}`;
    await RNFS.writeFile(path, content, 'utf8');

    try {
        await Share.open({
            url: `file://${path}`,
            failOnCancel: false,
        });
    } finally {
        await RNFS.unlink(path).catch(() => {
            // A leftover cache file is harmless because the operating system can reclaim it.
        });
    }
};

export default saveTextFile;
