import {isRecord} from '@libs/ObjectUtils';

type UnknownRecord = Record<string, unknown>;

function isObject(value: unknown): value is Record<PropertyKey, unknown> {
    return value !== null && typeof value === 'object';
}

function hasDefinedProperty(value: unknown, property: PropertyKey): boolean {
    return isObject(value) && property in value && value[property] !== undefined;
}

function requireRecord(value: unknown, label = 'value'): UnknownRecord {
    if (!isRecord(value)) {
        throw new Error(`Expected ${label} to be an object`);
    }
    return value;
}

function readProperty(value: unknown, key: string): unknown {
    return requireRecord(value, `container for ${key}`)[key];
}

function requireStringProperty(value: unknown, key: string): string {
    const property = readProperty(value, key);
    if (typeof property !== 'string') {
        throw new Error(`Expected ${key} to be a string`);
    }
    return property;
}

function getOptionalNumberProperty(value: unknown, key: string): number | undefined {
    const property = readProperty(value, key);
    if (property !== undefined && typeof property !== 'number') {
        throw new Error(`Expected ${key} to be a number when present`);
    }
    return property;
}

function requireRecordArrayProperty(value: unknown, key: string): UnknownRecord[] {
    const property = readProperty(value, key);
    if (!Array.isArray(property) || !property.every(isRecord)) {
        throw new Error(`Expected ${key} to be an array of objects`);
    }
    return property;
}

export {getOptionalNumberProperty, hasDefinedProperty, isObject, readProperty, requireRecord, requireRecordArrayProperty, requireStringProperty};
