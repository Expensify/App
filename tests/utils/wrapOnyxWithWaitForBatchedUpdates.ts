import type Onyx from 'react-native-onyx';
import type {Writable} from 'type-fest';
import waitForBatchedUpdates from './waitForBatchedUpdates';

/**
 * When we change data in onyx, the listeners (components) will be notified
 * on the "next tick" (which is implemented by resolving a promise).
 * That means, that we have to wait for the next tick, until the components
 * are rendered with the onyx data.
 * This is a convinience function, which wraps the onyxInstance's
 * functions, to for the promises to resolve.
 */
function wrapOnyxWithWaitForBatchedUpdates(onyxInstance: Writable<typeof Onyx>) {
    const multiSetImpl = onyxInstance.multiSet;
    // eslint-disable-next-line no-param-reassign
    onyxInstance.multiSet = (...args) => multiSetImpl(...args).then((result) => waitForBatchedUpdates().then(() => result));
    const mergeImpl = onyxInstance.merge;
    // eslint-disable-next-line no-param-reassign
    onyxInstance.merge = (...args) => mergeImpl(...args).then((result) => waitForBatchedUpdates().then(() => result));
}

export default wrapOnyxWithWaitForBatchedUpdates;
