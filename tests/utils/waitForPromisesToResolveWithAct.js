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
 * @returns {Promise}
 */
// eslint-disable-next-line @lwc/lwc/no-async-await
export default async function waitForPromisesToResolveWithAct() {
    // eslint-disable-next-line @lwc/lwc/no-async-await
    await act(async () => {
        await waitForPromisesToResolve();
    });
}
