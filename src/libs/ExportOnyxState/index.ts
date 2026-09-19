import saveTextFile from '@libs/saveTextFile';

import CONST from '@src/CONST';
import type OnyxState from '@src/types/onyx/OnyxState';

import Onyx from 'react-native-onyx';

const readOnyxState = (): Promise<OnyxState> => Onyx.exportState();

const shareAsFile = (fileContent: string): Promise<void> => saveTextFile({fileName: CONST.DEFAULT_ONYX_DUMP_FILE_NAME, content: fileContent});

export {maskOnyxState} from './masking';
export {readOnyxState, shareAsFile};
