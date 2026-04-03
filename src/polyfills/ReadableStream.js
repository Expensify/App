/**
 * Polyfills for ReadableStream.prototype.values and ReadableStream.prototype[Symbol.asyncIterator].
 * These are needed for the pdfjs-dist package to prevent console errors on Safari versions earlier than 24.4.
 */

if (typeof ReadableStream.prototype.values !== 'function') {
    Object.defineProperty(ReadableStream.prototype, 'values', {
        value({preventCancel = false} = {}) {
            const reader = this.getReader();
            return {
                async next() {
                    try {
                        const result = await reader.read();
                        if (result.done) {
                            reader.releaseLock();
                        }
                        return result;
                    } catch (e) {
                        reader.releaseLock();
                        throw e;
                    }
                },

                async return(value) {
                    if (!preventCancel) {
                        const cancelPromise = reader.cancel(value);
                        reader.releaseLock();
                        await cancelPromise;
                    } else {
                        reader.releaseLock();
                    }
                    return {done: true, value};
                },

                [Symbol.asyncIterator]() {
                    return this;
                },
            };
        },
        configurable: true,
        writable: true,
        enumerable: false,
    });
}

if (typeof ReadableStream.prototype[Symbol.asyncIterator] !== 'function') {
    Object.defineProperty(ReadableStream.prototype, Symbol.asyncIterator, {
        value: ReadableStream.prototype.values,
        configurable: true,
        writable: true,
        enumerable: false,
    });
}
