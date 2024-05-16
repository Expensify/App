// eslint-disable-next-line @typescript-eslint/ban-types
const shallowCompare = (obj1?: object, obj2?: object) => {
    if (!obj1 && !obj2) {
        return true;
    }
    if (obj1 && obj2) {
        // @ts-expect-error we know that obj1 and obj2 are params of a route.
        return Object.keys(obj1).length === Object.keys(obj2).length && Object.keys(obj1).every((key) => obj1[key] === obj2[key]);
    }
    return false;
};

export default shallowCompare;
