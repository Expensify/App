import getArrayDepth from './getArrayDepth';

function is2dArray<T>(array: T[] | T[][]): array is T[][] {
    return getArrayDepth(array) === 2;
}

export default is2dArray;
