import type {State} from '@libs/Navigation/types';

type InteractionType = 'keyboard' | 'pointer' | 'unknown';

type InteractionTrigger = 'enterOrSpace' | 'escape' | 'pointer' | 'unknown';

type InteractionProvenance = {
    interactionType: InteractionType;
    interactionTrigger: InteractionTrigger;
    routeKey: string | null;
};

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
    setElementQueryStrategyForTests: (queryStrategy?: (tagNameSelector: string) => readonly HTMLElement[]) => void;
    getInteractionProvenanceForTests: () => InteractionProvenance | null;
};

export type {InteractionProvenance, InteractionTrigger, InteractionType, NavigationFocusManagerModule};
