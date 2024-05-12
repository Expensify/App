type Action<T extends unknown[]> = (...params: T) => void | Promise<void>;

const singleExecution =
    <T extends unknown[]>(action?: Action<T>) =>
    (...params: T) => {
        action?.(...params);
    };

const hookValue = {isExecuting: false, singleExecution};

/**
 * This hook was specifically written for native issue
 * more information: https://github.com/Expensify/App/pull/24614 https://github.com/Expensify/App/pull/24173
 * on web we don't need this mechanism so we just call the action directly.
 */
export default function useSingleExecution() {
    return hookValue;
}

export type {Action};
