import type RNFSModule from './types';

const RNFS: RNFSModule = {
    exists: () => Promise.resolve(false),
    unlink: () => Promise.resolve(),
    copyFile: () => Promise.resolve(),
    DocumentDirectoryPath: '',
    writeFile: (path: string, data: string, encoding: string) => {
        const dataStr = `data:text/json;charset=${encoding},${encodeURIComponent(JSON.stringify(data))}`;
        const downloadAnchorNode = document.createElement('a');

        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', path);
        document.body.appendChild(downloadAnchorNode); // required for Firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

        return Promise.resolve();
    },
};

export default RNFS;
