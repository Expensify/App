import GetActiveElement from './types';

const getActiveElement: GetActiveElement = () => null;

const requestAnimationFrame = (callback: () => void) => {
    if (!callback) {
        return;
    }

    callback();
};

export default {
    getActiveElement,
    requestAnimationFrame,
};
