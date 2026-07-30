type ArrayStore<T> = {
    getSnapshot: () => readonly T[];
    getServerSnapshot: () => readonly T[];
    subscribe: (listener: () => void) => () => void;
    setSnapshot: (next: readonly T[]) => void;
};

function createArrayStore<T>(): ArrayStore<T> {
    const EMPTY_SNAPSHOT: readonly T[] = Object.freeze([]);
    let snapshot: readonly T[] = EMPTY_SNAPSHOT;
    const listeners = new Set<() => void>();

    return {
        getSnapshot: () => snapshot,
        getServerSnapshot: () => EMPTY_SNAPSHOT,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        setSnapshot: (next) => {
            if (Object.is(next, snapshot)) {
                return;
            }
            snapshot = next;
            for (const listener of listeners) {
                listener();
            }
        },
    };
}

export default createArrayStore;
export type {ArrayStore};
