import IsSelectorSupported from './types';

/**
 * Check platform supports the selector or not
 */
const isSelectorSupported: IsSelectorSupported = (selector) => {
    try {
        document.querySelector(selector);
        return true;
    } catch (error) {
        return false;
    }
};

export default isSelectorSupported;
