function hasKey<T extends object>(obj: T, key: PropertyKey): key is keyof T {
    return key in obj;
}

export default hasKey;
