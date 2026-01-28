import CONST from '@src/CONST';

type EmptyObject = Record<string, never>;

type EmptyValue = EmptyObject | null | undefined;

function isEmptyObject<T>(obj: T | EmptyValue): obj is EmptyValue {
    return Object.keys(obj ?? {}).length === 0;
}

function getEmptyObject<T>(): T {
    return CONST.EMPTY_OBJECT as T;
}

function isEmptyValueObject<T>(obj: T | EmptyValue) {
    return Object.values(obj ?? {}).filter((value) => value !== undefined && value !== null).length === 0;
}

export {isEmptyObject, getEmptyObject, isEmptyValueObject};
export type {EmptyObject};
