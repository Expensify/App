function arrayDifference<TItem>(array1: TItem[], array2: TItem[]): TItem[] {
    return [array1, array2].reduce((a, b) => a.filter((c) => !b.includes(c)));
}

export default arrayDifference;
