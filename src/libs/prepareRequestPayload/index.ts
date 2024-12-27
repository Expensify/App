import type PrepareRequestPayload from './types';

const prepareRequestPayload: PrepareRequestPayload = (data) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
        if (typeof data[key] === 'undefined') {
            return;
        }

        formData.append(key, data[key] as string | Blob);
    });

    return Promise.resolve(formData);
};

export default prepareRequestPayload;
