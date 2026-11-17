/**
 * Holds one value outside React, for components that subscribe to it with useSyncExternalStore. Each component can
 * select only its own answer from the value, so a change re-renders just the components whose answer changed, where a
 * context value change would re-render every consumer.
 */
type ValueStore<T> = {
    get: () => T;
    set: (value: T) => void;
    subscribe: (onChange: () => void) => () => void;
};

function createValueStore<T>(initialValue: T): ValueStore<T> {
    let value = initialValue;
    const listeners = new Set<() => void>();
    return {
        get: () => value,
        set: (nextValue) => {
            if (nextValue === value) {
                return;
            }
            value = nextValue;
            for (const listener of listeners) {
                listener();
            }
        },
        subscribe: (onChange) => {
            listeners.add(onChange);
            return () => {
                listeners.delete(onChange);
            };
        },
    };
}

export default createValueStore;
export type {ValueStore};
