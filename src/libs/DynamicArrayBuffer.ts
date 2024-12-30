type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;

type TypedArrayConstructor<T extends TypedArray> = {
    new (buffer: ArrayBuffer): T;
    new (buffer: ArrayBuffer, byteOffset: number, length: number): T;
    BYTES_PER_ELEMENT: number;
};

class DynamicArrayBuffer<T extends TypedArray> {
    private buffer: ArrayBuffer;

    public array: T; // Made public to allow direct indexed access

    private size: number;

    private readonly TypedArrayConstructor: TypedArrayConstructor<T>;

    constructor(initialCapacity: number, TypedArrayConstructor: TypedArrayConstructor<T>) {
        this.buffer = new ArrayBuffer(initialCapacity * this.getBytesPerElement(TypedArrayConstructor));
        this.array = new TypedArrayConstructor(this.buffer);
        this.size = 0;
        this.TypedArrayConstructor = TypedArrayConstructor;
    }

    private getBytesPerElement(constructor: TypedArrayConstructor<T>): number {
        return constructor.BYTES_PER_ELEMENT;
    }

    get capacity(): number {
        return this.array.length;
    }

    get length(): number {
        return this.size;
    }

    push(value: number): void {
        if (this.size === this.capacity) {
            this.resize(this.capacity * 2);
        }
        this.array[this.size++] = value;
    }

    private resize(newCapacity: number): void {
        console.log('Resizing to', newCapacity);
        const start = performance.now();
        if (typeof this.buffer.transfer === 'function') {
            console.log('Using ArrayBuffer.transfer');
            this.buffer = this.buffer.transfer(newCapacity * this.getBytesPerElement(this.TypedArrayConstructor));
            this.array = new this.TypedArrayConstructor(this.buffer);
        } else {
            console.log('Using manual copy');
            const newBuffer = new ArrayBuffer(newCapacity * this.getBytesPerElement(this.TypedArrayConstructor));
            const newArray = new this.TypedArrayConstructor(newBuffer);
            newArray.set(this.array);
            this.buffer = newBuffer;
            this.array = newArray;
        }
        console.log('Resized in', performance.now() - start, 'ms');
    }

    set(index: number, value: number): void {
        if (index < 0) {
            throw new Error('Index out of bounds');
        }

        // If the index is beyond our current capacity, resize
        while (index >= this.capacity) {
            this.resize(this.capacity * 2);
        }

        this.size = Math.max(this.size, index + 1);
        this.array[index] = value;
    }

    /**
     * Returns a new DynamicArrayBuffer containing elements from start to end (exclusive).
     * If end is not provided, slices to the end of the buffer.
     * Negative indices can be used to count from the end.
     */
    slice(start?: number, end?: number): DynamicArrayBuffer<T> {
        // Handle negative indices and undefined values
        const actualStart = start === undefined ? 0 : start < 0 ? Math.max(this.size + start, 0) : Math.min(start, this.size);
        const actualEnd = end === undefined ? this.size : end < 0 ? Math.max(this.size + end, 0) : Math.min(end, this.size);

        const sliceLength = Math.max(0, actualEnd - actualStart);
        const result = new DynamicArrayBuffer<T>(sliceLength, this.TypedArrayConstructor);

        if (typeof this.buffer.transfer === 'function') {
            // Create a temporary buffer with just the slice we want
            const tempBuffer = new ArrayBuffer(sliceLength * this.getBytesPerElement(this.TypedArrayConstructor));
            const tempArray = new this.TypedArrayConstructor(tempBuffer);
            tempArray.set(new this.TypedArrayConstructor(this.buffer, actualStart * this.getBytesPerElement(this.TypedArrayConstructor), sliceLength));

            // Transfer the temporary buffer to the result
            result.buffer = this.buffer.transfer(tempBuffer, sliceLength * this.getBytesPerElement(this.TypedArrayConstructor));
            result.array = new this.TypedArrayConstructor(result.buffer);
        } else {
            result.array.set(new this.TypedArrayConstructor(this.buffer, actualStart * this.getBytesPerElement(this.TypedArrayConstructor), sliceLength));
        }

        result.size = sliceLength;
        return result;
    }

    clamp(): void {
        if (this.size >= this.capacity) {
            return; // todo: does this make sense?
        }
        if (typeof ArrayBuffer.transfer === 'function') {
            this.buffer = ArrayBuffer.transfer(this.buffer, this.size * this.getBytesPerElement(this.TypedArrayConstructor));
        } else {
            const newBuffer = new ArrayBuffer(this.size * this.getBytesPerElement(this.TypedArrayConstructor));
            const newArray = new this.TypedArrayConstructor(newBuffer);
            newArray.set(new this.TypedArrayConstructor(this.buffer, 0, this.size));
            this.buffer = newBuffer;
        }
        this.array = new this.TypedArrayConstructor(this.buffer);
    }

    [Symbol.iterator](): Iterator<number> {
        let index = 0;
        return {
            next: (): IteratorResult<number> => {
                if (index < this.size) {
                    return {value: this.array[index++], done: false};
                }
                return {value: undefined, done: true};
            },
        };
    }
}

export default DynamicArrayBuffer;
