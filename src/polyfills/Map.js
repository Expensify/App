/**
 * Polyfills for Map.prototype.getOrInsert and Map.prototype.getOrInsertComputed.
 * These are required by the pdfjs-dist package and its web worker.
 * This file is written in JS rather than TS because it is loaded as a raw string alongside the web worker.
 */

if (typeof Map.prototype.getOrInsert !== 'function') {
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(Map.prototype, 'getOrInsert', {
        value(key, defaultValue) {
            if (!this.has(key)) {
                this.set(key, defaultValue);
                return defaultValue;
            }
            return this.get(key);
        },
        writable: true,
        configurable: true,
        enumerable: false,
    });
}

if (typeof Map.prototype.getOrInsertComputed !== 'function') {
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(Map.prototype, 'getOrInsertComputed', {
        value(key, callbackFunction) {
            if (!this.has(key)) {
                const value = callbackFunction(key);
                this.set(key, value);
                return value;
            }
            return this.get(key);
        },
        writable: true,
        configurable: true,
        enumerable: false,
    });
}
