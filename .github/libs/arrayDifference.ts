/**
 * This function is an equivalent of _.difference, it takes two arrays and returns the difference between them.
 * It returns an array of items that are in the first array but not in the second array.
 */
function arrayDifference<TItem>(array1: TItem[], array2: TItem[]): TItem[] {
    return [array1, array2].reduce((a, b) => a.filter((c) => !b.includes(c)));
}

export default arrayDifference;
