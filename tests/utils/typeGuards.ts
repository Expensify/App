function isObject(value: unknown): value is Record<PropertyKey, unknown> {
    return value !== null && typeof value === 'object';
}

function hasDefinedProperty(value: unknown, property: PropertyKey): boolean {
    return isObject(value) && property in value && value[property] !== undefined;
}

export {isObject, hasDefinedProperty};
