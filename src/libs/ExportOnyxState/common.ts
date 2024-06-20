import {Str} from 'expensify-common';
import ONYXKEYS from '@src/ONYXKEYS';

const maskFragileData = (data: Record<string, unknown>): Record<string, unknown> => {
    const maskedData: Record<string, unknown> = {};

    const keys = Object.keys(data).filter((key) => !key.includes(ONYXKEYS.COLLECTION.REPORT_ACTIONS));
    keys.forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(data, key)) {
            return;
        }

        const value = data[key];

        if (typeof value === 'string' && (Str.isValidEmail(value) || key === 'authToken' || key === 'encryptedAuthToken')) {
            maskedData[key] = '***';
        } else if (typeof value === 'object') {
            maskedData[key] = maskFragileData(value as Record<string, unknown>);
        } else {
            maskedData[key] = value;
        }
    });

    return maskedData;
};

export default {
    maskFragileData,
};
