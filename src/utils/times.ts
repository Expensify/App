function times(n: number, func = (i: number): string | number | undefined => i): Array<number | string | undefined> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return Array.from({length: n}).map((_, i) => func(i));
}

export default times;
