type Flatten<T> = {
    [K in keyof T]: T[K] extends object ? Flatten<T[K]> : T[K];
};

export function flattenObject<T extends object>(object: T): Flatten<T> {
    const result = {} as any;

    const flattenHelper = (obj: any, prefix = ''): void => {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newKey = prefix ? `${prefix}.${key}` : key;

                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    flattenHelper(obj[key], newKey);
                } else {
                    result[newKey] = obj[key];
                }
            }
        }
    };

    flattenHelper(object);
    return result as Flatten<T>;
}
