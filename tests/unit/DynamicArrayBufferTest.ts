import DynamicArrayBuffer from '@libs/DynamicArrayBuffer';

describe('DynamicArrayBuffer', () => {
    describe('basic operations', () => {
        let buffer: DynamicArrayBuffer<Float64Array>;

        beforeEach(() => {
            buffer = new DynamicArrayBuffer<Float64Array>(4, Float64Array);
        });

        test('initial state', () => {
            expect(buffer.length).toBe(0);
            expect(buffer.capacity).toBe(4);
        });

        test('push operation', () => {
            buffer.push(1.1);
            expect(buffer.length).toBe(1);
            expect(buffer.array[0]).toBe(1.1);
        });

        test('automatic resize', () => {
            // Fill initial capacity
            buffer.push(1.1);
            buffer.push(2.2);
            buffer.push(3.3);
            buffer.push(4.4);
            expect(buffer.capacity).toBe(4);

            // Trigger resize
            buffer.push(5.5);
            expect(buffer.capacity).toBe(8);
            expect(buffer.length).toBe(5);
            expect(buffer.array[4]).toBe(5.5);
        });

        test('array access', () => {
            buffer.push(1.1);
            buffer.push(2.2);

            expect(buffer.array[0]).toBe(1.1);
            buffer.array[0] = 3.3;
            expect(buffer.array[0]).toBe(3.3);
        });

        test('set method with bounds checking', () => {
            buffer.push(1.1);

            // Valid set
            buffer.set(0, 2.2);
            expect(buffer.array[0]).toBe(2.2);
            buffer.set(1, 3.3);
            expect(buffer.array[1]).toBe(3.3);
            expect(buffer.length).toBe(2);

            // Add a few more items to trigger an internal resize
            buffer.set(2, 4.4);
            buffer.set(3, 5.5);
            buffer.set(4, 6.6);
            expect(buffer.capacity).toBe(8);
            expect(buffer.length).toBe(5);

            // Out of bounds
            expect(() => buffer.set(-1, 1.1)).toThrow('Index out of bounds');
        });
    });

    describe('truncate operation', () => {
        test('truncate reduces capacity to actual size', () => {
            const buffer = new DynamicArrayBuffer<Float64Array>(8, Float64Array);
            buffer.push(1.1);
            buffer.push(2.2);

            expect(buffer.capacity).toBe(8);
            expect(buffer.length).toBe(2);
            buffer.truncate();
            expect(buffer.capacity).toBe(2);
            expect(buffer.length).toBe(2);
            expect(buffer.array[0]).toBe(1.1);
            expect(buffer.array[1]).toBe(2.2);
        });
    });

    describe('iteration', () => {
        test('supports Array.from', () => {
            const buffer = new DynamicArrayBuffer<Float64Array>(4, Float64Array);
            buffer.push(1.1);
            buffer.push(2.2);
            buffer.push(3.3);

            const array = Array.from(buffer);
            expect(array).toEqual([1.1, 2.2, 3.3]);
        });

        test('supports for...of loop', () => {
            const buffer = new DynamicArrayBuffer<Float64Array>(4, Float64Array);
            buffer.push(1.1);
            buffer.push(2.2);

            const values: number[] = [];
            for (const value of buffer) {
                values.push(value);
            }
            expect(values).toEqual([1.1, 2.2]);
        });

        test('supports spread operator', () => {
            const buffer = new DynamicArrayBuffer<Float64Array>(4, Float64Array);
            buffer.push(1.1);
            buffer.push(2.2);

            const array = [...buffer];
            expect(array).toEqual([1.1, 2.2]);
        });

        test('supports destructuring', () => {
            const buffer = new DynamicArrayBuffer<Float64Array>(4, Float64Array);
            buffer.push(1.1);
            buffer.push(2.2);
            buffer.push(3.3);

            const [first, second] = buffer;
            expect(first).toBe(1.1);
            expect(second).toBe(2.2);
        });
    });

    describe('different TypedArray types', () => {
        test('works with Int32Array', () => {
            const buffer = new DynamicArrayBuffer<Int32Array>(4, Int32Array);
            buffer.push(1);
            buffer.push(2);
            expect(buffer.array[0]).toBe(1);
            expect(buffer.array[1]).toBe(2);
        });

        test('works with Uint8Array', () => {
            const buffer = new DynamicArrayBuffer<Uint8Array>(4, Uint8Array);
            buffer.push(255);
            buffer.push(0);
            expect(buffer.array[0]).toBe(255);
            expect(buffer.array[1]).toBe(0);
        });
    });
});
