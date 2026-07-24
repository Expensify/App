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

function parseJSONValue(value: unknown, label: string): unknown {
    if (typeof value !== 'string') {
        throw new Error(`Expected ${label} to be a string`);
    }
    const parsed: unknown = JSON.parse(value);
    return parsed;
}

function parseJSONRecord(value: unknown, label = 'JSON payload'): UnknownRecord {
    return requireRecord(parseJSONValue(value, label), label);
}

export {hasDefinedProperty, isObject, parseJSONRecord};
