import {InteractionManager} from 'react-native';

function doInteractionTask(callback: () => void) {
    return InteractionManager.runAfterInteractions(() => {
        callback();
    });
}

export default doInteractionTask;
