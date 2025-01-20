function isEmptyValue<T>(value?: T): boolean {
    if (!value) {
        return true;
    }
    switch (value) {
        case 'undefined':
        case 'null':
        case '':
            return true;
        default:
            return false;
    }
}
export default isEmptyValue;
