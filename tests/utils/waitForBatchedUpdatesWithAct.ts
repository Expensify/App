import {act} from '@testing-library/react-native';
import waitForBatchedUpdates from './waitForBatchedUpdates';

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
 *     - You're not rendering any react components at all in your tests, but have some async logic you need to wait for e.g. Onyx.merge(). Use waitForBatchedUpdates().
 *     - You're writing UI tests but don't see any errors or warnings related to using act(). You probably don't need this in that case and should use waitForBatchedUpdates().
 *     - You're writing UI test and do see a warning about using act(), but there's no asynchronous code that needs to run inside act().
 */
async function waitForBatchedUpdatesWithAct(): Promise<void> {
    await act(async (): Promise<void> => {
        await waitForBatchedUpdates();
    });
}

export default waitForBatchedUpdatesWithAct;
