function arrayDifference<T = string>(array1: T[], array2: T[]): T[] {
    return [array1, array2].reduce((a, b) => a.filter((c) => !b.includes(c)));
}

export default arrayDifference;
