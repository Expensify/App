import type {JsonObject, JsonValue} from 'type-fest';

/** Narrows a JSON value to an object while excluding arrays and null. */
function isJSONObject(value: JsonValue | undefined): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Narrows a JSON value to a mutable array. */
function isJSONArray(value: JsonValue | undefined): value is JsonValue[] {
    return Array.isArray(value);
}

export {isJSONArray, isJSONObject};
