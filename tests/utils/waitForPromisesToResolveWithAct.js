import {act} from '@testing-library/react-native';
import waitForPromisesToResolve from './waitForPromisesToResolve';

/**
 * This method is necessary because react-navigation's NavigationContainer makes an internal state update when parsing the
 * linkingConfig to get the initialState. This throws some warnings related to async code if we do not wrap this call in an act().
 *
 * See: https://callstack.github.io/react-native-testing-library/docs/understanding-act/#asynchronous-act
 *
 * This apparently will not work unless we use async/await because of some kind of voodoo magic inside the react-test-renderer
 * so we are suppressing our lint rule and avoiding async/await everywhere else in our tests.
 *
 * When to use this:
 *
 *     - If you see the jest output complaining about needing to use act() AND the callback inside the act() returns a promise. We can't
 *       call .then() on act() and the test renderer wants us to use async/await so use this function instead.
 *
 *
 * When not to use this:
 *
 *     - You're not rendering any react components at all in your tests, but have some async logic you need to wait for e.g. Onyx.merge(). Use waitForPromisesToResolve().
 *     - You're writing UI tests but don't see any errors or warnings related to using act(). You probably don't need this in that case and should use waitForPromisesToResolve().
 *     - You're writing UI test and do see a warning about using act(), but there's no asynchronous code that needs to run inside act().
 *
 * @returns {Promise}
 */
// eslint-disable-next-line @lwc/lwc/no-async-await
export default async function waitForPromisesToResolveWithAct() {
    // eslint-disable-next-line @lwc/lwc/no-async-await
    await act(async () => {
        await waitForPromisesToResolve();
    });
}
