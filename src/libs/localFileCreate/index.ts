import * as FileUtils from '@libs/fileDownload/FileUtils';

const localFileCreate = (fileName: string, textContent: string) => {
    const newFileName = FileUtils.appendTimeToFileName(fileName);
    const blob = new Blob([textContent], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);

    return Promise.resolve({path: url, newFileName});
};

export default localFileCreate;
