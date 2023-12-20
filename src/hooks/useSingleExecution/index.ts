import {useCallback} from 'react';

type Action<T extends unknown[]> = (...params: T) => void | Promise<void>;

/**
 * This hook was specifically written for native issue
 * more information: https://github.com/Expensify/App/pull/24614 https://github.com/Expensify/App/pull/24173
 * on web we don't need this mechanism so we just call the action directly.
 */
export default function useSingleExecution() {
    const singleExecution = useCallback(
        <T extends unknown[]>(action: Action<T>) =>
            (...params: T) => {
                action(...params);
            },
        [],
    );

    return {isExecuting: false, singleExecution};
}
