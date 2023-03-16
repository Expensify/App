import DevMenu from 'react-native-dev-menu';
import RNShake from 'react-native-shake';

function shakeEventTrigger(onTrigger) {
    if (__DEV__) {
        // For Developers
        DevMenu.addItem('Report bug', onTrigger);
    }

    // For the rest of the world
    RNShake.addListener(onTrigger);

    return () => {
        RNShake.removeAllListeners();
    };
}

export default shakeEventTrigger;
