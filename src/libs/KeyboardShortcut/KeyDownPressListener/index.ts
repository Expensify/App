import type {AddKeyDownPressListener, RemoveKeyDownPressListener} from './types';

const addKeyDownPressListener: AddKeyDownPressListener = (callbackFunction) => {
    document.addEventListener('keydown', callbackFunction);
};

const removeKeyDownPressListener: RemoveKeyDownPressListener = (callbackFunction) => {
    document.removeEventListener('keydown', callbackFunction);
};

export {addKeyDownPressListener, removeKeyDownPressListener};
