/** Compare editable fields with their initialized values, excluding draft metadata. */
import CONST from '@src/CONST';

import {resolveStateCode} from './CountryUtils';

function normalizeField(value: unknown, key: string, country: unknown): unknown {
    if (typeof value !== 'string') {
        return value;
    }
    const trimmedValue = value.trim();
    if ((key === 'state' || key === 'addressState') && country === CONST.COUNTRY.US) {
        return resolveStateCode(trimmedValue);
    }
    if (key === 'zipPostCode' || key === 'addressZipCode') {
        return trimmedValue.toUpperCase();
    }
    return trimmedValue;
}

function hasFormChanges(values: Record<string, unknown> | null | undefined, initialValues: Record<string, unknown>): boolean {
    return Object.keys(initialValues).some((key) => {
        const value = values?.[key];
        if (value === undefined || value === null) {
            return false;
        }
        return normalizeField(value, key, values?.country ?? initialValues.country) !== normalizeField(initialValues[key] ?? '', key, initialValues.country);
    });
}

export default hasFormChanges;
