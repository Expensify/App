import type {State} from '@libs/Navigation/types';

type NavigationFocusManagerModule = {
    initialize: () => void;
    destroy: () => void;
    captureForRoute: (routeKey: string) => void;
    retrieveForRoute: (routeKey: string) => HTMLElement | null;
    clearForRoute: (routeKey: string) => void;
    hasStoredFocus: (routeKey: string) => boolean;
    registerFocusedRoute: (routeKey: string) => void;
    unregisterFocusedRoute: (routeKey: string) => void;
    wasRecentKeyboardInteraction: () => boolean;
    clearKeyboardInteractionFlag: () => void;
    getCapturedAnchorElement: () => HTMLElement | null;
    cleanupRemovedRoutes: (state: State) => void;
};

export default NavigationFocusManagerModule;
