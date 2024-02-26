import DomUtils from '@libs/DomUtils';
import type DoInteractionTask from './types';

const doInteractionTask: DoInteractionTask = (callback) => {
    DomUtils.requestAnimationFrame(callback);
    return null;
};

export default doInteractionTask;
