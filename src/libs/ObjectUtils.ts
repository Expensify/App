import type {ValueOf} from 'type-fest';

const getDefinedKeys = (obj: Record<string, unknown>): string[] => {
    return Object.entries(obj)
        .filter(([, value]) => value !== undefined)
        .map(([key]) => key);
};

const shallowCompare = (obj1?: Record<string, unknown>, obj2?: Record<string, unknown>): boolean => {
    if (!obj1 && !obj2) {
        return true;
    }
    if (obj1 && obj2) {
        const keys1 = getDefinedKeys(obj1);
        const keys2 = getDefinedKeys(obj2);
        return keys1.length === keys2.length && keys1.every((key) => obj1[key] === obj2[key]);
    }
    return false;
};

function filterObject<TObject extends Record<string, unknown>>(obj: TObject, predicate: (key: keyof TObject, value: ValueOf<TObject>) => boolean): TObject {
    return Object.keys(obj)
        .filter((key: keyof TObject) => predicate(key, obj[key]))
        .reduce<TObject>((result, key: keyof TObject) => {
            // eslint-disable-next-line no-param-reassign
            result[key] = obj[key];
            return result;
        }, {} as TObject);
}

type MapToObjectResult<T> = T extends Map<infer K, infer V> ? Record<K extends string | number | symbol ? K : string, MapToObjectResult<V>> : T;

/**
 * Recursively converts a Map (and any nested Maps) to a plain object.
 */
function mapToObject<K extends string | number | symbol, V>(map: Map<K, V>): Record<K, MapToObjectResult<V>> {
    const result = {} as Record<K, MapToObjectResult<V>>;
    for (const [key, value] of map.entries()) {
        result[key] = (value instanceof Map ? mapToObject(value) : value) as MapToObjectResult<V>;
    }
    return result;
}

export {shallowCompare, filterObject, mapToObject};
