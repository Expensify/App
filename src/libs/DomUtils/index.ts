import GetActiveElement from './types';

const getActiveElement: GetActiveElement = () => document.activeElement;

export default {
    getActiveElement,
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
};
