function set<T extends Record<string, unknown>, U>(obj: T, path: string | string[], value: U): void {
    const pathArray = Array.isArray(path) ? path : path.split('.');

    pathArray.reduce((acc: Record<string, unknown>, key: string, i: number) => {
        if (acc[key] === undefined) {
            acc[key] = {};
        }
        if (i === pathArray.length - 1) {
            (acc[key] as U) = value;
        }
        return acc[key] as Record<string, unknown>;
    }, obj);
}

export default set;
