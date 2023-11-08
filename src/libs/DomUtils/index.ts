import GetActiveElement from './types';

const getActiveElement: GetActiveElement = () => (document.activeElement as HTMLElement);

export default {
    getActiveElement,
};
