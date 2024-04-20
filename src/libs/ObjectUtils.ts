// eslint-disable-next-line @typescript-eslint/ban-types
const shallowCompare = (obj1?: object, obj2?: object) => {
    if (!obj1 && !obj2) {
        return true;
    }
    if (obj1 && obj2) {
        const keys1 = Object.keys(obj1) as Array<keyof typeof obj1>;
        const keys2 = Object.keys(obj2) as Array<keyof typeof obj2>;
        return keys1.length === keys2.length && keys1.every((key) => obj1[key] === obj2[key]);
    }
    return false;
};

export default shallowCompare;
