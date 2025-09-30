declare module 'array.prototype.tosorted' {
    function getPolyfill(): typeof Array.prototype.toSorted;
    function shim(): typeof Array.prototype.toSorted;
    function implementation<T>(compareFn?: (a: T, b: T) => number): T[];

    export {getPolyfill, shim, implementation};
}
