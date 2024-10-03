import Onyx from 'react-native-onyx';
import Sound from 'react-native-sound';
import type {ValueOf} from 'type-fest';
import ONYXKEYS from '@src/ONYXKEYS';
import config from './config';

let isMuted = false;

Onyx.connect({
    key: ONYXKEYS.USER,
    callback: (val) => (isMuted = !!val?.isMutedAllSounds),
});

const SOUNDS = {
    DONE: 'done',
    SUCCESS: 'success',
    ATTENTION: 'attention',
    RECEIVE: 'receive',
} as const;

/**
 * Creates a version of the given function that, when called, queues the execution and ensures that
 * calls are spaced out by at least the specified `minExecutionTime`, even if called more frequently. This allows
 * for throttling frequent calls to a function, ensuring each is executed with a minimum `minExecutionTime` between calls.
 * Each call returns a promise that resolves when the function call is executed, allowing for asynchronous handling.
 */
function withMinimalExecutionTime<F extends (...args: Parameters<F>) => ReturnType<F>>(func: F, minExecutionTime: number) {
    const queue: Array<[() => ReturnType<F>, (value?: unknown) => void]> = [];
    let timerId: NodeJS.Timeout | null = null;

    function processQueue() {
        if (queue.length > 0) {
            const next = queue.shift();

            if (!next) {
                return;
            }

            const [nextFunc, resolve] = next;
            nextFunc();
            resolve();
            timerId = setTimeout(processQueue, minExecutionTime);
        } else {
            timerId = null;
        }
    }

    return function (...args: Parameters<F>) {
        return new Promise((resolve) => {
            queue.push([() => func(...args), resolve]);

            if (!timerId) {
                // If the timer isn't running, start processing the queue
                processQueue();
            }
        });
    };
}

export {SOUNDS, withMinimalExecutionTime, isMuted};
