type CompareFn<T> = (a: T, b: T) => number;

class Heap<T = number> {
    private compare: CompareFn<T>;

    private nodes: T[];

    private leaf: T | null;

    constructor(compare: CompareFn<T>, _values?: T[]) {
        if (typeof compare !== 'function') {
            throw new Error('Heap constructor expects a compare function');
        }
        this.compare = compare;
        this.nodes = Array.isArray(_values) ? [..._values] : [];
        this.leaf = null;
    }

    private hasLeftChild(parentIndex: number): boolean {
        const leftChildIndex = parentIndex * 2 + 1;
        return leftChildIndex < this.size();
    }

    private hasRightChild(parentIndex: number): boolean {
        const rightChildIndex = parentIndex * 2 + 2;
        return rightChildIndex < this.size();
    }

    private compareAt(i: number, j: number): number {
        const a = this.nodes.at(i);
        const b = this.nodes.at(j);
        if (a === undefined || b === undefined) {
            throw new Error(`Index out of bounds: ${i}, ${j}`);
        }
        return this.compare(a, b);
    }

    private swap(i: number, j: number): void {
        const tempA = this.nodes.at(i);
        const tempB = this.nodes.at(j);
        if (tempA === undefined || tempB === undefined) {
            throw new Error(`Index out of bounds: ${i}, ${j}`);
        }
        this.nodes[i] = tempB;
        this.nodes[j] = tempA;
    }

    private shouldSwap(parentIndex: number, childIndex: number): boolean {
        if (parentIndex < 0 || parentIndex >= this.size()) {
            return false;
        }
        if (childIndex < 0 || childIndex >= this.size()) {
            return false;
        }
        return this.compareAt(parentIndex, childIndex) > 0;
    }

    private compareChildrenOf(parentIndex: number): number {
        if (!this.hasLeftChild(parentIndex) && !this.hasRightChild(parentIndex)) {
            return -1;
        }
        const leftChildIndex = parentIndex * 2 + 1;
        const rightChildIndex = parentIndex * 2 + 2;

        if (!this.hasLeftChild(parentIndex)) {
            return rightChildIndex;
        }
        if (!this.hasRightChild(parentIndex)) {
            return leftChildIndex;
        }
        const compare = this.compareAt(leftChildIndex, rightChildIndex);
        return compare > 0 ? rightChildIndex : leftChildIndex;
    }

    private bubbleUp(startIndex: number): void {
        let childIndex = startIndex;
        let parentIndex = Math.floor((childIndex - 1) / 2);

        while (this.shouldSwap(parentIndex, childIndex)) {
            this.swap(parentIndex, childIndex);
            childIndex = parentIndex;
            parentIndex = Math.floor((childIndex - 1) / 2);
        }
    }

    private bubbleDown(startIndex: number): void {
        let parentIndex = startIndex;
        let childIndex = this.compareChildrenOf(parentIndex);

        while (this.shouldSwap(parentIndex, childIndex)) {
            this.swap(parentIndex, childIndex);
            parentIndex = childIndex;
            childIndex = this.compareChildrenOf(parentIndex);
        }
    }

    push(value: T): this {
        this.nodes.push(value);
        this.bubbleUp(this.size() - 1);
        if (this.leaf === null || this.compare(value, this.leaf) > 0) {
            this.leaf = value;
        }
        return this;
    }

    pop(): T | null {
        if (this.isEmpty()) {
            return null;
        }

        const root = this.peek();
        this.nodes[0] = this.nodes[this.size() - 1];
        this.nodes.pop();
        this.bubbleDown(0);

        if (root === this.leaf) {
            this.leaf = null;
        }
        return root;
    }

    peek(): T | null {
        if (this.isEmpty()) {
            return null;
        }
        return this.nodes.at(0) ?? null;
    }

    size(): number {
        return this.nodes.length;
    }

    isEmpty(): boolean {
        return this.size() === 0;
    }

    clear(): void {
        this.nodes = [];
        this.leaf = null;
    }

    *[Symbol.iterator](): Iterator<T | null> {
        let size = this.size();
        while (size-- > 0) {
            yield this.pop();
        }
    }
}

export type {CompareFn};
export {Heap};
