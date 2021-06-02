import {AppState} from 'react-native';

/**
 * @return {Boolean}
 */
function isVisible() {
    return AppState.currentState === 'active';
}

export default {
    isVisible,
};
