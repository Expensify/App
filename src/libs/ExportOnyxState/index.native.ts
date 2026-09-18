import CONST from '@src/CONST';

import RNFS from 'react-native-fs';
import Onyx from 'react-native-onyx';
import Share from 'react-native-share';

import type {ExportOnyxStateModule, ReadOnyxState, ShareAsFile} from './types';

import {maskOnyxState} from './common';

const readOnyxState: ReadOnyxState = () => Onyx.exportState();

const shareAsFile: ShareAsFile = async (fileContent) => {
    // The dump only needs to live long enough to be shared, so it goes in Caches, which
    // is never exposed to the user (unlike Documents, which the iOS Files app shows when
    // file sharing is enabled) and which the OS can reclaim afterwards
    const infoFilePath = `${RNFS.CachesDirectoryPath}/${CONST.DEFAULT_ONYX_DUMP_FILE_NAME}`;
    const actualInfoFile = `file://${infoFilePath}`;

    await RNFS.writeFile(infoFilePath, fileContent, 'utf8');
    try {
        // Share targets copy the file while the share sheet is open, so once the promise
        // settles (including cancel, since failOnCancel is false) the dump can be deleted
        await Share.open({
            url: actualInfoFile,
            failOnCancel: false,
        });
    } finally {
        await RNFS.unlink(infoFilePath).catch(() => {});
    }
};

const ExportOnyxState: ExportOnyxStateModule = {
    maskOnyxState,
    readOnyxState,
    shareAsFile,
};

export default ExportOnyxState;
