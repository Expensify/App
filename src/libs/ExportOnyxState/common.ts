import {Str} from 'expensify-common';
import ONYXKEYS from '@src/ONYXKEYS';

const maskFragileData = (data: Record<string, unknown>, parentKey?: string): Record<string, unknown> => {
    const maskedData: Record<string, unknown> = {};

    if (!data) {
        return maskedData;
    }

    Object.keys(data).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(data, key)) {
            return;
        }

        const value = data[key];

        if (typeof value === 'string' && (Str.isValidEmail(value) || key === 'authToken' || key === 'encryptedAuthToken')) {
            maskedData[key] = '***';
        } else if (parentKey && parentKey.includes(ONYXKEYS.COLLECTION.REPORT_ACTIONS) && (key === 'text' || key === 'html')) {
            maskedData[key] = '***';
        } else if (typeof value === 'object') {
            maskedData[key] = maskFragileData(value as Record<string, unknown>, key.includes(ONYXKEYS.COLLECTION.REPORT_ACTIONS) ? key : parentKey);
        } else {
            maskedData[key] = value;
        }
    });

    return maskedData;
};

export default {
    maskFragileData,
};
