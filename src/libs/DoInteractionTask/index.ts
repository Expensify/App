import type DoInteractionTask from './types';

const doInteractionTask: DoInteractionTask = (callback) => {
    callback();
    return null;
};

export default doInteractionTask;
