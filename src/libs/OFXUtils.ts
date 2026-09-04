import CONST from '@src/CONST';

import {splitExtensionFromFileName} from './fileDownload/FileUtils';

/**
 * An OFX/QFX statement is parsed by the backend, so the import flow branches on this.
 */
function isOFXStatement(fileName: string): boolean {
    const extensions: readonly string[] = CONST.OFX_STATEMENT_EXTENSIONS;
    return extensions.includes(splitExtensionFromFileName(fileName).fileExtension.toLowerCase());
}

// eslint-disable-next-line import/prefer-default-export
export {isOFXStatement};
