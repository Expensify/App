import saveTextFile from '@libs/saveTextFile';

import CONST from '@src/CONST';

import Onyx from 'react-native-onyx';

import type {ExportOnyxStateModule, ReadOnyxState, ShareAsFile} from './types';

import {maskOnyxState} from './common';

const readOnyxState: ReadOnyxState = () => Onyx.exportState({includeStaleRamOnlyKeys: true});

const shareAsFile: ShareAsFile = (fileContent) => saveTextFile({fileName: CONST.DEFAULT_ONYX_DUMP_FILE_NAME, content: fileContent});

const ExportOnyxState: ExportOnyxStateModule = {
    maskOnyxState,
    readOnyxState,
    shareAsFile,
};

export default ExportOnyxState;
