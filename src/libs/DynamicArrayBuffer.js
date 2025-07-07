"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A TypedArray that can grow dynamically (similar to c++ std::vector).
 * You still need to provide an initial size. If the array grows beyond the initial size, it will be resized to double the size.
 */
var DynamicArrayBuffer = /** @class */ (function () {
    function DynamicArrayBuffer(initialCapacity, TypedArrayConstructor) {
        this.buffer = new ArrayBuffer(initialCapacity * this.getBytesPerElement(TypedArrayConstructor));
        this.array = new TypedArrayConstructor(this.buffer);
        this.size = 0;
        this.TypedArrayConstructor = TypedArrayConstructor;
    }
    DynamicArrayBuffer.prototype.getBytesPerElement = function (constructor) {
        return constructor.BYTES_PER_ELEMENT;
    };
    Object.defineProperty(DynamicArrayBuffer.prototype, "capacity", {
        get: function () {
            return this.array.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DynamicArrayBuffer.prototype, "length", {
        get: function () {
            return this.size;
        },
        enumerable: false,
        configurable: true
    });
    DynamicArrayBuffer.prototype.push = function (value) {
        var capacity = this.array.length; // avoid function calls for performance
        if (this.size === capacity) {
            this.resize(capacity * 2);
        }
        this.array[this.size++] = value;
    };
    DynamicArrayBuffer.prototype.resize = function (newCapacity) {
        if (typeof this.buffer.transfer === 'function') {
            this.buffer = this.buffer.transfer(newCapacity * this.getBytesPerElement(this.TypedArrayConstructor));
            this.array = new this.TypedArrayConstructor(this.buffer);
        }
        else {
            var newBuffer = new ArrayBuffer(newCapacity * this.getBytesPerElement(this.TypedArrayConstructor));
            var newArray = new this.TypedArrayConstructor(newBuffer);
            newArray.set(this.array);
            this.buffer = newBuffer;
            this.array = newArray;
        }
    };
    DynamicArrayBuffer.prototype.set = function (index, value) {
        if (index < 0) {
            throw new Error('Index out of bounds');
        }
        // If the index is beyond our current capacity, resize
        var capacity = this.array.length; // avoid function calls for performance
        while (index >= capacity) {
            this.resize(capacity * 2);
        }
        this.size = Math.max(this.size, index + 1);
        this.array[index] = value;
    };
    DynamicArrayBuffer.prototype.truncate = function (end) {
        if (end === void 0) { end = this.size; }
        var length = end;
        this.buffer = this.buffer.slice(0, length * this.getBytesPerElement(this.TypedArrayConstructor));
        this.array = new this.TypedArrayConstructor(this.buffer);
        this.size = length;
        return this;
    };
    DynamicArrayBuffer.prototype.clear = function () {
        this.truncate(0);
    };
    DynamicArrayBuffer.prototype[Symbol.iterator] = function () {
        var _this = this;
        var index = 0;
        return {
            next: function () {
                if (index < _this.size) {
                    return { value: _this.array[index++], done: false };
                }
                return { value: undefined, done: true };
            },
        };
    };
    return DynamicArrayBuffer;
}());
exports.default = DynamicArrayBuffer;
