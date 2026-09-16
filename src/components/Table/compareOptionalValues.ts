/**
 * Compares two optional cell values, keeping rows without a value last in both sort directions and falling back to
 * `tieBreaker` when the values match or are both missing.
 */
function compareOptionalValues(value1: string, value2: string, compare: (a: string, b: string) => number, orderMultiplier: number, tieBreaker: number): number {
    if (!value1 && !value2) {
        return tieBreaker;
    }

    if (!value1) {
        return 1;
    }

    if (!value2) {
        return -1;
    }

    const comparison = compare(value1, value2);

    return comparison !== 0 ? comparison * orderMultiplier : tieBreaker;
}

export default compareOptionalValues;
