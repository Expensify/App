import CONST from '@src/CONST';

import Onyx from 'react-native-onyx';

import type {ExportOnyxStateModule, ReadOnyxState, ShareAsFile} from './types';

import {maskOnyxState} from './common';

const readOnyxState: ReadOnyxState = () => Onyx.exportState();

const shareAsFile: ShareAsFile = async (fileContent) => {
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(fileContent)}`);
    element.setAttribute('download', CONST.DEFAULT_ONYX_DUMP_FILE_NAME);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
};

const ExportOnyxState: ExportOnyxStateModule = {
    maskOnyxState,
    readOnyxState,
    shareAsFile,
};

export default ExportOnyxState;
