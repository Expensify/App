import type NavigationFocusManagerModule from './types';

const NavigationFocusManager: NavigationFocusManagerModule = {
    initialize: () => {},
    destroy: () => {},
    captureForRoute: () => {},
    retrieveForRoute: () => null,
    retrieveKeyboardFocusForRoute: () => null,
    clearForRoute: () => {},
    hasStoredFocus: () => false,
    hasKeyboardStoredFocus: () => false,
    registerFocusedRoute: () => {},
    unregisterFocusedRoute: () => {},
    wasRecentKeyboardInteraction: () => false,
    clearKeyboardInteractionFlag: () => {},
    getCapturedAnchorElement: () => null,
    cleanupRemovedRoutes: () => {},
};

export default NavigationFocusManager;
