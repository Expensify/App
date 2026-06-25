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

function getObjectKeys<T extends Record<string, unknown>>(obj: T): Array<keyof T> {
    return Object.keys(obj) as Array<keyof T>;
}

function getObjectValues<T extends Record<string, unknown>>(obj: T): Array<ValueOf<T>> {
    // Needed for functionality
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return Object.values(obj) as Array<ValueOf<T>>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export {shallowCompare, getObjectValues, filterObject, isRecord, getObjectKeys};
