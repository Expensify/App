function arrayLastElement<T>(array: T[] | undefined | null, comparator?: (el1: T, el2: T) => number, filter: (el: T) => boolean = () => true): T | undefined {
    if (!array?.length) {
        return undefined;
    }
    if (array.length === 1) {
        return array.at(0);
    }
    let i = array.findIndex((el) => filter(el));
    if (i === -1) {
        return undefined;
    }
    let candidateElement = array.at(i) as T;
    while (i < array.length) {
        const element = array.at(i) as T;
        if (filter(element)) {
            if (!comparator && element >= candidateElement) {
                candidateElement = element;
            }
            if (comparator && comparator(element, candidateElement) >= 0) {
                candidateElement = element;
            }
        }
        i++;
    }
    return candidateElement;
}

export default arrayLastElement;
