import {Heap} from './Heap';

type GetCompareValue<T> = (item: T) => number | string;

/**
 * Comparison function for a max-heap based on the provided `getCompareValue` function.
 * @param getCompareValue
 */
function getMaxCompare<T>(getCompareValue?: GetCompareValue<T>): (a: T, b: T) => number {
    return (a, b) => {
        const aVal = typeof getCompareValue === 'function' ? getCompareValue(a) : a;
        const bVal = typeof getCompareValue === 'function' ? getCompareValue(b) : b;
        return aVal >= bVal ? -1 : 1;
    };
}

/**
 * MaxHeap is a priority queue that always keeps the largest element at the top.
 * Internally, it uses a binary heap structure to ensure that insertion (`push`)
 * and removal of the maximum element (`pop`) are efficient, both operating in O(log n) time.
 *
 * The heap is constructed using a comparator derived from an optional `getCompareValue` function,
 * which allows comparing complex objects based on a specific property.
 * If no comparison function is provided, direct value comparison is used.
 *
 * Typical use cases include:
 * - Finding the largest element in a dynamic dataset
 * - Implementing efficient top-k queries (e.g., 10 largest items from a large list)
 * - Scheduling or prioritizing tasks based on weight or priority value
 *
 * Elements can be added via `push`, removed with `pop`, and inspected with `peek`.
 * The heap also supports iteration, which destructively yields elements in descending order.
 *
 * Example:
 * ```ts
 * const heap = new MaxHeap<number>();
 * heap.push(4).push(1).push(3);
 * console.log(heap.pop()); // 4
 * ```
 */
class MaxHeap<T = number> {
    private heap: Heap<T>;

    constructor(getCompareValue?: GetCompareValue<T>) {
        this.heap = new Heap<T>(getMaxCompare(getCompareValue));
    }

    push(value: T): this {
        this.heap.push(value);
        return this;
    }

    pop(): T | null {
        return this.heap.pop();
    }

    peek(): T | null {
        return this.heap.peek();
    }

    size(): number {
        return this.heap.size();
    }

    isEmpty(): boolean {
        return this.heap.isEmpty();
    }

    clear(): void {
        this.heap.clear();
    }

    *[Symbol.iterator](): Iterator<T> {
        let size = this.size();
        while (size-- > 0) {
            const poppedValue = this.pop();
            if (poppedValue === null) {
                break;
            }
            yield poppedValue;
        }
    }
}

export type {GetCompareValue};
export {MaxHeap};