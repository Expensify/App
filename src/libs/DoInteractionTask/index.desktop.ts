import {InteractionManager} from 'react-native';
import type DoInteractionTask from './types';

// For desktop, we should call the callback after all interactions to prevent freezing. See more detail in https://github.com/Expensify/App/issues/28916
const doInteractionTask: DoInteractionTask = (callback) =>
    InteractionManager.runAfterInteractions(() => {
        callback();
    });

export default doInteractionTask;
