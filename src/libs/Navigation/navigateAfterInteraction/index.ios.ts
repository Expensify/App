import {InteractionManager} from 'react-native';
import Navigation from '@libs/Navigation/Navigation';

function navigateAfterInteraction(callback: () => void) {
    InteractionManager.runAfterInteractions(() => {
        Navigation.setNavigationActionToMicrotaskQueue(callback);
    });
}

export default navigateAfterInteraction;
