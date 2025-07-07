"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
exports.Heap = void 0;
/**
 * Heap is a generic binary heap implementation that supports both min-heap and max-heap behavior,
 * depending on the comparison function provided at instantiation.
 *
 * It maintains the heap property using an array-based binary tree structure, enabling efficient
 * `push` (insert), `pop` (remove top), and `peek` (inspect top) operations, each with O(log n) time complexity.
 *
 * The comparison function defines the ordering logic:
 * - For a min-heap, the function should return a negative value when `a < b`.
 * - For a max-heap, the function should return a negative value when `a > b`.
 *
 * This class serves as the underlying engine for more specialized heaps (like `MinHeap` or `MaxHeap`),
 * and can be used directly for custom ordering logic (e.g. sorting by multiple fields).
 *
 * @template T - The type of elements in the heap, defaults to number.
 */
var Heap = /** @class */ (function () {
    function Heap(compare, _values) {
        if (typeof compare !== 'function') {
            throw new Error('Heap constructor expects a compare function');
        }
        this.compare = compare;
        this.nodes = Array.isArray(_values) ? __spreadArray([], _values, true) : [];
        this.leaf = null;
    }
    Heap.prototype.hasLeftChild = function (parentIndex) {
        var leftChildIndex = parentIndex * 2 + 1;
        return leftChildIndex < this.size();
    };
    Heap.prototype.hasRightChild = function (parentIndex) {
        var rightChildIndex = parentIndex * 2 + 2;
        return rightChildIndex < this.size();
    };
    Heap.prototype.compareAt = function (i, j) {
        var a = this.nodes.at(i);
        var b = this.nodes.at(j);
        if (a === undefined || b === undefined) {
            throw new Error("Index out of bounds: ".concat(i, ", ").concat(j));
        }
        return this.compare(a, b);
    };
    Heap.prototype.swap = function (i, j) {
        var tempA = this.nodes.at(i);
        var tempB = this.nodes.at(j);
        if (tempA === undefined || tempB === undefined) {
            throw new Error("Index out of bounds: ".concat(i, ", ").concat(j));
        }
        this.nodes[i] = tempB;
        this.nodes[j] = tempA;
    };
    Heap.prototype.shouldSwap = function (parentIndex, childIndex) {
        if (parentIndex < 0 || parentIndex >= this.size()) {
            return false;
        }
        if (childIndex < 0 || childIndex >= this.size()) {
            return false;
        }
        return this.compareAt(parentIndex, childIndex) > 0;
    };
    Heap.prototype.compareChildrenOf = function (parentIndex) {
        if (!this.hasLeftChild(parentIndex) && !this.hasRightChild(parentIndex)) {
            return -1;
        }
        var leftChildIndex = parentIndex * 2 + 1;
        var rightChildIndex = parentIndex * 2 + 2;
        if (!this.hasLeftChild(parentIndex)) {
            return rightChildIndex;
        }
        if (!this.hasRightChild(parentIndex)) {
            return leftChildIndex;
        }
        var compare = this.compareAt(leftChildIndex, rightChildIndex);
        return compare > 0 ? rightChildIndex : leftChildIndex;
    };
    Heap.prototype.bubbleUp = function (startIndex) {
        var childIndex = startIndex;
        var parentIndex = Math.floor((childIndex - 1) / 2);
        while (this.shouldSwap(parentIndex, childIndex)) {
            this.swap(parentIndex, childIndex);
            childIndex = parentIndex;
            parentIndex = Math.floor((childIndex - 1) / 2);
        }
    };
    Heap.prototype.bubbleDown = function (startIndex) {
        var parentIndex = startIndex;
        var childIndex = this.compareChildrenOf(parentIndex);
        while (this.shouldSwap(parentIndex, childIndex)) {
            this.swap(parentIndex, childIndex);
            parentIndex = childIndex;
            childIndex = this.compareChildrenOf(parentIndex);
        }
    };
    Heap.prototype.push = function (value) {
        this.nodes.push(value);
        this.bubbleUp(this.size() - 1);
        if (this.leaf === null || this.compare(value, this.leaf) > 0) {
            this.leaf = value;
        }
        return this;
    };
    Heap.prototype.pop = function () {
        if (this.isEmpty()) {
            return null;
        }
        var root = this.peek();
        this.nodes[0] = this.nodes[this.size() - 1];
        this.nodes.pop();
        this.bubbleDown(0);
        if (root === this.leaf) {
            this.leaf = null;
        }
        return root;
    };
    Heap.prototype.peek = function () {
        var _a;
        if (this.isEmpty()) {
            return null;
        }
        return (_a = this.nodes.at(0)) !== null && _a !== void 0 ? _a : null;
    };
    Heap.prototype.size = function () {
        return this.nodes.length;
    };
    Heap.prototype.isEmpty = function () {
        return this.size() === 0;
    };
    Heap.prototype.clear = function () {
        this.nodes = [];
        this.leaf = null;
    };
    Heap.prototype[Symbol.iterator] = function () {
        var size;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    size = this.size();
                    _a.label = 1;
                case 1:
                    if (!(size-- > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, this.pop()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    };
    return Heap;
}());
exports.Heap = Heap;
