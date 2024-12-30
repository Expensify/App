type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;

type TypedArrayConstructor<T extends TypedArray> = {
    new (buffer: ArrayBuffer): T;
    new (buffer: ArrayBuffer, byteOffset: number, length: number): T;
    BYTES_PER_ELEMENT: number;
};

/**
 * A TypedArray that can grow dynamically (similar to c++ std::vector).
 * You still need to provide an initial size. If the array grows beyond the initial size, it will be resized to double the size.
 */
class DynamicArrayBuffer<T extends TypedArray> {
    private buffer: ArrayBuffer;

    public array: T;

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
        if (typeof this.buffer.transfer === 'function') {
            this.buffer = this.buffer.transfer(newCapacity * this.getBytesPerElement(this.TypedArrayConstructor));
            this.array = new this.TypedArrayConstructor(this.buffer);
        } else {
            const newBuffer = new ArrayBuffer(newCapacity * this.getBytesPerElement(this.TypedArrayConstructor));
            const newArray = new this.TypedArrayConstructor(newBuffer);
            newArray.set(this.array);
            this.buffer = newBuffer;
            this.array = newArray;
        }
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

    truncate(end = this.size): DynamicArrayBuffer<T> {
        const length = end;
        this.buffer = this.buffer.slice(0, length * this.getBytesPerElement(this.TypedArrayConstructor));
        this.array = new this.TypedArrayConstructor(this.buffer);

        this.size = length;
        return this;
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
