/**
 * Polyfill for Uint8Array.prototype.toHex.
 * It is required by the pdfjs-dist's web worker on Chrome versions earlier than 140.
 * This file is written in JS rather than TS because it is loaded as a raw string alongside the worker.
 */

if (typeof Uint8Array.prototype.toHex !== 'function') {
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(Uint8Array.prototype, 'toHex', {
        value: function toHex() {
            let out = '';
            for (const value of this) {
                out += value.toString(16).padStart(2, '0');
            }
            return out;
        },
        writable: true,
        configurable: true,
        enumerable: false,
    });
}
