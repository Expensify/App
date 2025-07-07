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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinHeap = void 0;
var Heap_1 = require("./Heap");
/**
 * Comparison function for a min-heap based on the provided `getCompareValue` function.
 * @param getCompareValue
 */
function getMinCompare(getCompareValue) {
    return function (a, b) {
        var aVal = typeof getCompareValue === 'function' ? getCompareValue(a) : a;
        var bVal = typeof getCompareValue === 'function' ? getCompareValue(b) : b;
        return aVal <= bVal ? -1 : 1;
    };
}
/**
 * MinHeap is a priority queue that always keeps the smallest element at the top.
 * Internally, it uses a binary heap structure to ensure that insertion (`push`)
 * and removal of the minimum element (`pop`) are efficient, both operating in O(log n) time.
 *
 * The heap is constructed using a comparator derived from an optional `getCompareValue` function,
 * which allows comparing complex objects based on a specific property.
 * If no comparison function is provided, direct value comparison is used.
 *
 * Typical use cases include:
 * - Finding the smallest element in a dynamic dataset
 * - Implementing efficient top-k queries (e.g., 10 smallest items from a large list)
 * - Scheduling or prioritizing tasks based on weight or priority value
 *
 * Elements can be added via `push`, removed with `pop`, and inspected with `peek`.
 * The heap also supports iteration, which destructively yields elements in ascending order.
 *
 * Example:
 * ```ts
 * const heap = new MinHeap<number>();
 * heap.push(4).push(1).push(3);
 * console.log(heap.pop()); // 1
 * ```
 */
var MinHeap = /** @class */ (function () {
    function MinHeap(getCompareValue) {
        this.heap = new Heap_1.Heap(getMinCompare(getCompareValue));
    }
    MinHeap.prototype.push = function (value) {
        this.heap.push(value);
        return this;
    };
    MinHeap.prototype.pop = function () {
        return this.heap.pop();
    };
    MinHeap.prototype.peek = function () {
        return this.heap.peek();
    };
    MinHeap.prototype.size = function () {
        return this.heap.size();
    };
    MinHeap.prototype.isEmpty = function () {
        return this.heap.isEmpty();
    };
    MinHeap.prototype.clear = function () {
        this.heap.clear();
    };
    MinHeap.prototype[Symbol.iterator] = function () {
        var size, poppedValue;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    size = this.size();
                    _a.label = 1;
                case 1:
                    if (!(size-- > 0)) return [3 /*break*/, 3];
                    poppedValue = this.pop();
                    if (poppedValue === null) {
                        return [3 /*break*/, 3];
                    }
                    return [4 /*yield*/, poppedValue];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    };
    return MinHeap;
}());
exports.MinHeap = MinHeap;
