import type ResetSigningOutContentShown from './types';

/**
 * Resets the signing out content shown state in sessionStorage
 */
const resetSigningOutContentShown: ResetSigningOutContentShown = () => {
    sessionStorage.removeItem('signingOutContentShown');
};

export default resetSigningOutContentShown;
