function getArrayDepth(arr: unknown[]): number {
    if (arr.length === 0) {
        return 1;
    }
    return 1 + Math.max(0, ...arr.map((item) => (Array.isArray(item) ? getArrayDepth(item) : 0)));
}

export default getArrayDepth;
