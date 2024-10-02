import {Str} from 'expensify-common';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';

const MASKING_PATTERN = '***';

const maskSessionDetails = (data: Record<string, unknown>): Record<string, unknown> => {
    const session = data.session as Session;
    const maskedData: Record<string, unknown> = {};

    Object.keys(session).forEach((key) => {
        if (key !== 'authToken' && key !== 'encryptedAuthToken') {
            maskedData[key] = session[key as keyof Session];
            return;
        }
        maskedData[key] = MASKING_PATTERN;
    });

    return {
        ...data,
        session: maskedData,
    };
};

const maskFragileData = (data: Record<string, unknown> | unknown[], parentKey?: string): Record<string, unknown> | unknown[] => {
    if (Array.isArray(data)) {
        return data.map((item): unknown => (typeof item === 'object' ? maskFragileData(item as Record<string, unknown>, parentKey) : item));
    }

    const maskedData: Record<string, unknown> = {};

    Object.keys(data).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(data, key)) {
            return;
        }

        const value = data[key];

        if (typeof value === 'string' && Str.isValidEmail(value)) {
            maskedData[key] = MASKING_PATTERN;
        } else if (parentKey && parentKey.includes(ONYXKEYS.COLLECTION.REPORT_ACTIONS) && (key === 'text' || key === 'html')) {
            maskedData[key] = MASKING_PATTERN;
        } else if (typeof value === 'object') {
            maskedData[key] = maskFragileData(value as Record<string, unknown>, key.includes(ONYXKEYS.COLLECTION.REPORT_ACTIONS) ? key : parentKey);
        } else {
            maskedData[key] = value;
        }
    });

    return maskedData;
};

const maskOnyxState = (data: Record<string, unknown>, isMaskingFragileDataEnabled?: boolean) => {
    let onyxState = data;
    // Mask session details by default
    onyxState = maskSessionDetails(onyxState);
    // Mask fragile data other than session details if the user has enabled the option
    if (isMaskingFragileDataEnabled) {
        onyxState = maskFragileData(onyxState) as Record<string, unknown>;
    }

    return onyxState;
};

export default {maskOnyxState};
