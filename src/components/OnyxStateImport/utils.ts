import type {UnknownRecord} from 'type-fest';
import ONYXKEYS from '@src/ONYXKEYS';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
}

// List of Onyx keys from the .txt file we want to keep for the local override
const keysToOmit = [ONYXKEYS.ACTIVE_CLIENTS, ONYXKEYS.BETAS, ONYXKEYS.FREQUENTLY_USED_EMOJIS, ONYXKEYS.NETWORK, ONYXKEYS.CREDENTIALS, ONYXKEYS.SESSION];

function transformNumericKeysToArray(data: UnknownRecord): UnknownRecord | unknown[] {
    const dataCopy = data;
    if (typeof dataCopy !== 'object' || dataCopy === null) {
        return dataCopy;
    }

    const keys = Object.keys(dataCopy);
    const allKeysAreNumeric = keys.every((key) => !Number.isNaN(key));
    const keysAreSequential = keys.every((key, index) => parseInt(key, 10) === index);

    if (allKeysAreNumeric && keysAreSequential) {
        return keys.map((key) => {
            if (isRecord(dataCopy)) {
                return transformNumericKeysToArray(dataCopy[key] as UnknownRecord);
            }
            return dataCopy;
        });
    }

    if (isRecord(dataCopy)) {
        for (const key in dataCopy) {
            if (key in dataCopy) {
                dataCopy[key] = transformNumericKeysToArray(dataCopy[key] as UnknownRecord);
            }
        }
    }

    return dataCopy;
}

export {keysToOmit, transformNumericKeysToArray};
