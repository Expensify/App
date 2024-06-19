import {Str} from 'expensify-common';

const maskFragileData = (data: Record<string, unknown>): Record<string, unknown> => {
    const maskedData: Record<string, unknown> = {};

    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key];
            if (typeof value === 'string' && (Str.isValidEmail(value) || key === 'authToken' || key === 'encryptedAuthToken')) {
                maskedData[key] = '***';
            } else if (typeof value === 'object') {
                maskedData[key] = maskFragileData(value as Record<string, unknown>);
            } else {
                maskedData[key] = value;
            }
        }
    }

    return maskedData;
};

export default {
    maskFragileData,
};
