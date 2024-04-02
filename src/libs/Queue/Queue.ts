import type Queue from './QueueType';

// Function to create a new queue
function createQueue<T>(processItem: (item: T) => void): Queue<T> {
    // Array to hold the elements of the queue
    const elements: T[] = [];

    // Function to add an item to the end of the queue
    function enqueue(item: T): void {
        elements.push(item);
    }

    // Function to remove an item from the front of the queue
    function dequeue(): T | undefined {
        return elements.shift();
    }

    // Function to check if the queue is empty
    function isEmpty(): boolean {
        return elements.length === 0;
    }

    // Function to get the item at the front of the queue without removing it
    function peek(): T | undefined {
        return elements.length > 0 ? elements[0] : undefined;
    }

    // Function to get the number of items in the queue
    function size(): number {
        return elements.length;
    }

    /**
     * Processes the next item in the queue.
     * If the queue is not empty, it dequeues the next item and processes it.
     * If the queue is empty, it does nothing.
     */
    function processNextItem(): void {
        dequeue();
        if (isEmpty()) {
            return;
        }

        const nextItem = peek();
        if (nextItem !== undefined) {
            processItem(nextItem);
        }
    }

    // Return an object with the queue operations
    return {
        enqueue,
        dequeue,
        isEmpty,
        peek,
        size,
        processNextItem,
    };
}

export default createQueue;
