import CONST from '@src/CONST';

type EmptyObject = Record<string, never>;

type EmptyValue = EmptyObject | null | undefined;

function isEmptyObject<T>(obj: T | EmptyValue): obj is EmptyValue {
    return Object.keys(obj ?? {}).length === 0;
}

function getEmptyObject<T>(): T {
    return CONST.EMPTY_OBJECT as T;
}

export {isEmptyObject, getEmptyObject};
export type {EmptyObject};
