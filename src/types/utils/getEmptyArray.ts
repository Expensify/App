import CONST from '@src/CONST';

function getEmptyArray<T>(): T[] {
    return CONST.EMPTY_ARRAY as unknown as T[];
}

export default getEmptyArray;
