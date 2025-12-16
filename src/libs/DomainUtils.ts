import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';

/**
 * DEV ONLY HELPER - do not use in production code
 * Applies two sets of Onyx state updates with a delay between them.
 * Useful for simulating state transitions or testing optimistic updates.
 *
 * @param firstData - The first set of Onyx updates to apply (e.g., optimisticData)
 * @param secondData - The second set of Onyx updates to apply after delay (e.g., successData)
 * @param delayMs - The delay in milliseconds between applying the updates (defaults to 1000ms)
 * @returns A promise that resolves when both updates are complete
 */
async function applyUpdatesWithDelay(firstData: OnyxUpdate[], secondData: OnyxUpdate[], delayMs = 1000): Promise<void> {
    await Onyx.update(firstData);
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            Onyx.update(secondData).then(resolve);
        }, delayMs);
    });
}

// eslint-disable-next-line import/prefer-default-export
export {applyUpdatesWithDelay};
