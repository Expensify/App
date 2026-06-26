type ExternalStore<T> = {
    readonly getSnapshot: () => T;
    readonly getServerSnapshot: () => T;
    readonly subscribe: (listener: () => void) => () => void;
};

type ExternalStoreHandle<T> = ExternalStore<T> & {
    readonly read: () => T;
    readonly set: (next: T) => void;
    readonly mutate: (mutator: (current: T) => T) => void;
};

function createExternalStore<T>(initial: T, emptyServerSnapshot: T = initial): ExternalStoreHandle<T> {
    let snapshot: T = initial;
    const listeners = new Set<() => void>();

    function notify(): void {
        for (const listener of listeners) {
            listener();
        }
    }

    function getSnapshot(): T {
        return snapshot;
    }

    function getServerSnapshot(): T {
        return emptyServerSnapshot;
    }

    function subscribe(listener: () => void): () => void {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }

    function set(next: T): void {
        if (Object.is(next, snapshot)) {
            return;
        }
        snapshot = next;
        notify();
    }

    function mutate(mutator: (current: T) => T): void {
        set(mutator(snapshot));
    }

    return {
        getSnapshot,
        getServerSnapshot,
        subscribe,
        read: getSnapshot,
        set,
        mutate,
    };
}

export default createExternalStore;
