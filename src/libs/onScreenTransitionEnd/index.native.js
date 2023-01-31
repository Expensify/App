/**
 * Navigation's transitionEnd is not reliable on IOS thus we use InteractonManager
 * Some information https://github.com/software-mansion/react-native-screens/issues/713
*/
import {InteractionManager} from 'react-native';

/**
 * Call the callback after screen transiton has ended
 *
 * @param {Object} navigation Screen navigation prop
 * @param {Function} callback Method to call
 * @returns {Function}
 */
function onScreenTransitionEnd(navigation, callback) {
    const handle = InteractionManager.runAfterInteractions(callback);
    return () => handle.cancel();
}

export default onScreenTransitionEnd;
