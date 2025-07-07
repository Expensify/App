"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var DynamicArrayBuffer_1 = require("@libs/DynamicArrayBuffer");
describe('DynamicArrayBuffer', function () {
    describe('basic operations', function () {
        var buffer;
        beforeEach(function () {
            buffer = new DynamicArrayBuffer_1.default(4, Float64Array);
        });
        test('initial state', function () {
            expect(buffer.length).toBe(0);
            expect(buffer.capacity).toBe(4);
        });
        test('push operation', function () {
            buffer.push(1.1);
            expect(buffer.length).toBe(1);
            expect(buffer.array[0]).toBe(1.1);
        });
        test('automatic resize', function () {
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
        test('array access', function () {
            buffer.push(1.1);
            buffer.push(2.2);
            expect(buffer.array[0]).toBe(1.1);
            buffer.array[0] = 3.3;
            expect(buffer.array[0]).toBe(3.3);
        });
    });
    describe('truncate operation', function () {
        test('truncate reduces capacity to actual size', function () {
            var buffer = new DynamicArrayBuffer_1.default(8, Float64Array);
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
    describe('iteration', function () {
        test('supports Array.from', function () {
            var buffer = new DynamicArrayBuffer_1.default(4, Float64Array);
            buffer.push(1.1);
            buffer.push(2.2);
            buffer.push(3.3);
            var array = Array.from(buffer);
            expect(array).toEqual([1.1, 2.2, 3.3]);
        });
        test('supports for...of loop', function () {
            var buffer = new DynamicArrayBuffer_1.default(4, Float64Array);
            buffer.push(1.1);
            buffer.push(2.2);
            var values = [];
            for (var _i = 0, buffer_1 = buffer; _i < buffer_1.length; _i++) {
                var value = buffer_1[_i];
                values.push(value);
            }
            expect(values).toEqual([1.1, 2.2]);
        });
        test('supports spread operator', function () {
            var buffer = new DynamicArrayBuffer_1.default(4, Float64Array);
            buffer.push(1.1);
            buffer.push(2.2);
            var array = __spreadArray([], buffer, true);
            expect(array).toEqual([1.1, 2.2]);
        });
        test('supports destructuring', function () {
            var buffer = new DynamicArrayBuffer_1.default(4, Float64Array);
            buffer.push(1.1);
            buffer.push(2.2);
            buffer.push(3.3);
            var first = buffer[0], second = buffer[1];
            expect(first).toBe(1.1);
            expect(second).toBe(2.2);
        });
    });
    describe('different TypedArray types', function () {
        test('works with Int32Array', function () {
            var buffer = new DynamicArrayBuffer_1.default(4, Int32Array);
            buffer.push(1);
            buffer.push(2);
            expect(buffer.array[0]).toBe(1);
            expect(buffer.array[1]).toBe(2);
        });
        test('works with Uint8Array', function () {
            var buffer = new DynamicArrayBuffer_1.default(4, Uint8Array);
            buffer.push(255);
            buffer.push(0);
            expect(buffer.array[0]).toBe(255);
            expect(buffer.array[1]).toBe(0);
        });
    });
});
