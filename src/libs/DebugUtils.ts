import type {OnyxEntry} from 'react-native-onyx';

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

function compareStringWithOnyxData(text: string, data: OnyxEntry<unknown>) {
    if (data === undefined) {
        return text === 'undefined';
    }

    if (typeof data === 'object') {
        return text === JSON.stringify(data, null, 6);
    }

    return text === String(data);
}

function getNumberOfLinesFromString(data: string) {
    return data.split('\n').length || 1;
}

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
