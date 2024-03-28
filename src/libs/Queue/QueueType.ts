type Queue<T> = {
    enqueue: (item: T) => void;
    dequeue: () => T | undefined;
    isEmpty: () => boolean;
    peek: () => T | undefined;
    size: () => number;
};

export default Queue;
