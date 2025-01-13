import validateFormDataParameter from '@libs/validateFormDataParameter';
import type PrepareRequestPayload from './types';

const prepareRequestPayload: PrepareRequestPayload = (command, data, initiatedOffline) => {
    const formData = new FormData();
    let promiseChain = Promise.resolve();

    Object.keys(data).forEach((key) => {
        promiseChain = promiseChain.then(() => {
            const value = data[key];

            if (value === undefined) {
                return Promise.resolve();
            }

            if (key === 'receipt' && initiatedOffline) {
                const {uri: path = '', source} = value as File;

                return import('@libs/fileDownload/FileUtils').then(({readFileAsync}) =>
                    readFileAsync(source, path, () => {}).then((file) => {
                        if (!file) {
                            return;
                        }

                        validateFormDataParameter(command, key, value);
                        formData.append(key, file);
                    }),
                );
            }

            validateFormDataParameter(command, key, value);
            formData.append(key, value as string | Blob);

            return Promise.resolve();
        });
    });

    return promiseChain.then(() => formData);
};

export default prepareRequestPayload;
