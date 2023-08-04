import {InteractionManager} from 'react-native';
import {useCallback, useState} from 'react';

/**
 * With any action passed in, it will only allow 1 such action to occur at a time.
 *
 * @returns {Object}
 */
export default function useSingleExecution() {
    const [isExecuting, setIsExecuting] = useState(false);

    const singleExecution = useCallback(
        (action) => () => {
            if (isExecuting) {
                return;
            }

            setIsExecuting(true);

            const execution = action();
            InteractionManager.runAfterInteractions(() => {
                if (!(execution instanceof Promise)) {
                    setIsExecuting(false);
                    return;
                }
                execution.finally(() => {
                    setIsExecuting(false);
                });
            });
        },
        [isExecuting],
    );

    return {isExecuting, singleExecution};
}
