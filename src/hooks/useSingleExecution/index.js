import { useCallback } from 'react';

/**
 * This hook was specifically written for native issue
 * more information: https://github.com/Expensify/App/pull/24614 https://github.com/Expensify/App/pull/24173
 * on web we don't need this mechanism so we just call the action directly.
 *
 * @returns {Object}
 */
export default function useSingleExecution() {
    const singleExecution = useCallback(
        (action) =>
            (...params) => {
                action(...params);
            },
        [],
    );

    return { isExecuting: false, singleExecution };
}
