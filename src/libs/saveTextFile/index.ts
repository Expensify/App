import createDownloadLink from '@libs/fileDownload/createDownloadLink';
import localFileCreate from '@libs/localFileCreate';

import type SaveTextFile from './types';

const saveTextFile: SaveTextFile = async ({fileName, content}) => {
    const {path, newFileName} = await localFileCreate(fileName, content, false);
    createDownloadLink(path, newFileName);
};

export default saveTextFile;
