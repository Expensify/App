import localFileCreate from '@libs/localFileCreate';

import type SaveTextFile from './types';

const saveTextFile: SaveTextFile = async ({fileName, content}) => {
    const {path, newFileName} = await localFileCreate(fileName, content, false);
    const link = document.createElement('a');
    link.href = path;
    link.download = newFileName;
    link.style.display = 'none';

    try {
        document.body.appendChild(link);
        link.click();
    } finally {
        link.remove();
        URL.revokeObjectURL(path);
    }
};

export default saveTextFile;
