import RNRestart from 'react-native-restart';

/**
 * Reload the app with current route
 */
function reloadApp() {
    RNRestart.Restart();
}

export default {
    reloadApp,
};
