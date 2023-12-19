function times<TReturnType>(n: number, func: (index: number) => TReturnType = (i) => i as TReturnType): TReturnType[] {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return Array.from({length: n}).map((_, i) => func(i));
}

export default times;
