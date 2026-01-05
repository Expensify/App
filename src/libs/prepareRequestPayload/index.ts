import validateFormDataParameter from '@libs/validateFormDataParameter';
import type PrepareRequestPayload from './types';

/**
 * Prepares the request payload (body) for a given command and data.
 */
const prepareRequestPayload: PrepareRequestPayload = (command, data) => {
    const formData = new FormData();

    for (const key of Object.keys(data)) {
        const value = data[key];

        if (value === undefined) {
            continue;
        }

        validateFormDataParameter(command, key, value);
        formData.append(key, value as string | Blob);
    }

    return Promise.resolve(formData);
};

export default prepareRequestPayload;
