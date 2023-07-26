import waitForPromisesToResolve from './waitForPromisesToResolve';

/**
 * When we change data in onyx, the listeners (components) will be notified
 * on the "next tick" (which is implemented by resolving a promise).
 * That means, that we have to wait for the next tick, until the components
 * are rendered with the onyx data.
 * This is a convinience function, which wraps the onyxInstance's
 * functions, to for the promises to resolve.
 *
 * @param {Object} onyxInstance
 */
export default function wrapOnyxWithWaitForPromisesToResolve(onyxInstance) {
    const multiSetImpl = onyxInstance.multiSet;
    // eslint-disable-next-line no-param-reassign
    onyxInstance.multiSet = (...args) => multiSetImpl(...args).then((result) => waitForPromisesToResolve().then(() => result));
    const mergeImpl = onyxInstance.merge;
    // eslint-disable-next-line no-param-reassign
    onyxInstance.merge = (...args) => mergeImpl(...args).then((result) => waitForPromisesToResolve().then(() => result));
}
