function times<TReturnType>(n: number, func: (index: number) => TReturnType = (i) => i as TReturnType): TReturnType[] {
    return Array.from({length: n}).map((_, i) => func(i));
}

export default times;
