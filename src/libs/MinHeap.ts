import {Heap} from './Heap';

type GetCompareValue<T> = (item: T) => number | string;

function getMinCompare<T>(getCompareValue?: GetCompareValue<T>): (a: T, b: T) => number {
    return (a, b) => {
        const aVal = typeof getCompareValue === 'function' ? getCompareValue(a) : a;
        const bVal = typeof getCompareValue === 'function' ? getCompareValue(b) : b;
        return aVal <= bVal ? -1 : 1;
    };
}

class MinHeap<T = number> {
    private heap: Heap<T>;

    constructor(getCompareValue?: GetCompareValue<T>) {
        this.heap = new Heap<T>(getMinCompare(getCompareValue));
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
export {MinHeap};
