import {InteractionManager} from 'react-native';

// For desktop, we should call the callback after all interactions to prevent freezing. See more detail in https://github.com/Expensify/App/issues/28916
function doInteractionTask(callback: () => void) {
    return InteractionManager.runAfterInteractions(() => {
        callback();
    });
}

export default doInteractionTask;
