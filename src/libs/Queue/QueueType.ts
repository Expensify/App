type Queue<T> = {
    run(): Promise<void>;
    enqueue: (item: T) => void;
    dequeue: () => T | undefined;
    isEmpty: () => boolean;
    peek: () => T | undefined;
    size: () => number;
};

export default Queue;
