import type {NavigationFocusManagerModule} from './types';

const NavigationFocusManager: NavigationFocusManagerModule = {
    initialize: () => {},
    destroy: () => {},
    captureForRoute: () => {},
    retrieveForRoute: () => null,
    clearForRoute: () => {},
    hasStoredFocus: () => false,
    registerFocusedRoute: () => {},
    unregisterFocusedRoute: () => {},
    wasRecentKeyboardInteraction: () => false,
    clearKeyboardInteractionFlag: () => {},
    getCapturedAnchorElement: () => null,
    cleanupRemovedRoutes: () => {},
    setElementQueryStrategyForTests: () => {},
    getInteractionProvenanceForTests: () => null,
};

export default NavigationFocusManager;
