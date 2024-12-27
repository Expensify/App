import {readFileAsync} from '@libs/fileDownload/FileUtils';
import type PrepareRequestPayload from './types';

const prepareRequestPayload: PrepareRequestPayload = (data, initiatedOffline) => {
    const formData = new FormData();
    let promiseChain = Promise.resolve();

    Object.keys(data).forEach((key) => {
        promiseChain = promiseChain.then(() => {
            if (typeof data[key] === 'undefined') {
                return Promise.resolve();
            }

            if (key === 'receipt' && initiatedOffline) {
                const {uri: path = '', source} = data[key] as File;

                return readFileAsync(source, path, () => {}).then((file) => {
                    if (!file) {
                        return;
                    }

                    formData.append(key, file);
                });
            }

            formData.append(key, data[key] as string | Blob);

            return Promise.resolve();
        });
    });

    return promiseChain.then(() => formData);
};

export default prepareRequestPayload;
