import * as ApiUtils from '@libs/ApiUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import * as FileUtils from './FileUtils';
import type {FileDownload} from './types';

/**
 * The function downloads an attachment on desktop platforms.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fileDownload: FileDownload = (url, fileName, successMessage = '', shouldOpenExternalLink = false) => {
    
    return Promise.resolve();
};

export default fileDownload;
