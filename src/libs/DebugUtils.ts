import type {OnyxEntry} from 'react-native-onyx';

/**
 * Converts onyx data into string representation
 *
 * @param data - data to be converted into string
 * @returns converted data
 */
function onyxDataToString(data: OnyxEntry<unknown>) {
    if (data === undefined) {
        return 'undefined';
    }

    if (typeof data === 'object') {
        return JSON.stringify(data, null, 6);
    }

    return String(data);
}
type OnyxDataType = 'number' | 'bigint' | 'object' | 'string' | 'boolean' | 'symbol' | 'function' | 'undefined';

type OnyxData<T extends OnyxDataType> = (T extends 'number' ? number : T extends 'object' ? Record<string, unknown> : T extends 'string' ? string : boolean) | null;

/**
 * Converted strings into the expected onyx data type
 *
 * @param data - string representation of the data is going to be converted
 * @param type - expected type
 * @returns conversion result of data into the expected type
 * @throws {SyntaxError} if type is object but the provided string does not represent an object
 */
function stringToOnyxData<T extends OnyxDataType = 'string'>(data: string, type?: T): OnyxData<T> {
    let onyxData;

    switch (type) {
        case 'number':
            onyxData = Number(data);
            break;
        case 'bigint':
            onyxData = BigInt(data);
            break;
        case 'object':
            onyxData = JSON.parse(data.replaceAll('\n', '')) as Record<string, unknown>;
            break;
        case 'boolean':
            onyxData = data === 'true';
            break;
        case 'symbol':
            onyxData = Symbol(data);
            break;
        case 'undefined':
            onyxData = null;
            break;
        default:
            onyxData = data;
    }

    return onyxData as OnyxData<T>;
}

/**
 * Compares string representation of onyx data with the original data, using type conversion
 *
 * @param text - string representation
 * @param data - original data
 * @returns whether or not the string representation is equal to the original data
 */
function compareStringWithOnyxData(text: string, data: OnyxEntry<unknown>) {
    if (data === undefined) {
        return text === 'undefined';
    }

    if (typeof data === 'object') {
        return text === JSON.stringify(data, null, 6);
    }

    return text === String(data);
}

/**
 * Determines the number of lines needed to display the data
 *
 * @param data - string representation
 * @returns number of lines needed to display the data
 */
function getNumberOfLinesFromString(data: string) {
    return data.split('\n').length || 1;
}

/**
 * Converts every value from an onyx data object into it's string representation, to be used as draft data
 *
 * @param data - onyx data object
 * @returns converted data object
 */
function onyxDataToDraftData(data: OnyxEntry<Record<string, unknown>>) {
    return Object.fromEntries(Object.entries(data ?? {}).map(([key, value]) => [key, onyxDataToString(value)]));
}

const DebugUtils = {
    onyxDataToDraftData,
    onyxDataToString,
    stringToOnyxData,
    compareStringWithOnyxData,
    getNumberOfLinesFromString,
};

export default DebugUtils;
