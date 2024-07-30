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
type OnyxDataType = 'number' | 'object' | 'string' | 'boolean';

type OnyxData<T extends OnyxDataType> = (T extends 'number' ? number : T extends 'object' ? Record<string, unknown> : T extends 'string' ? string : boolean) | null;

function stringToOnyxData<T extends OnyxDataType = 'string'>(data: string, type?: T): OnyxData<T> {
    if (data === 'undefined') {
        return null;
    }

    let onyxData;

    switch (type) {
        case 'number':
            onyxData = Number(data);
            break;
        case 'object':
            onyxData = JSON.parse(data) as Record<string, unknown>;
            break;
        case 'boolean':
            onyxData = data === 'true';
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

const DebugUtils = {
    onyxDataToString,
    stringToOnyxData,
    compareStringWithOnyxData,
    getNumberOfLinesFromString,
};

export default DebugUtils;
