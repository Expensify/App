const RNFS = {
    exists: () => Promise.resolve(false),
    unlink: () => Promise.resolve(true),
    copyFile: () => Promise.resolve(true),
    DocumentDirectoryPath: '',
    writeFile: (path: string, data: string, encoding: string) => {
        const dataStr = `data:text/json;charset=${encoding},${encodeURIComponent(JSON.stringify(data))}`;
        const downloadAnchorNode = document.createElement('a');

        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', path);
        document.body.appendChild(downloadAnchorNode); // required for Firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    },
};

export default RNFS;
