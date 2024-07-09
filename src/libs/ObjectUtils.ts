const shallowCompare = (obj1?: Record<string, unknown>, obj2?: Record<string, unknown>): boolean => {
    if (!obj1 && !obj2) {
        return true;
    }
    if (obj1 && obj2) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        return keys1.length === keys2.length && keys1.every((key) => obj1[key] === obj2[key]);
    }
    return false;
};

export default shallowCompare;
