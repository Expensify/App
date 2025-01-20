import validateFormDataParameter from '@libs/validateFormDataParameter';
import type PrepareRequestPayload from './types';

const prepareRequestPayload: PrepareRequestPayload = (command, data) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
        const value = data[key];

        if (value === undefined) {
            return;
        }

        validateFormDataParameter(command, key, value);
        formData.append(key, value as string | Blob);
    });

    return Promise.resolve(formData);
};

export default prepareRequestPayload;
