import type {State} from '@libs/Navigation/types';

type InteractionType = 'keyboard' | 'pointer' | 'unknown';

type InteractionTrigger = 'enterOrSpace' | 'escape' | 'pointer' | 'unknown';

type RetrievalMode = 'keyboardSafe' | 'legacy';

type ElementRefCandidateMetadata =
    | {
          source: 'interactionValidated';
          confidence: 3;
      }
    | {
          source: 'activeElementFallback';
          confidence: 1;
      }
    | null;

type IdentifierCandidateMetadata = {
    source: 'identifierMatchReady';
    confidence: 2;
} | null;

type RouteFocusMetadata = {
    interactionType: InteractionType;
    interactionTrigger: InteractionTrigger;
    elementRefCandidate: ElementRefCandidateMetadata;
    identifierCandidate: IdentifierCandidateMetadata;
};

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
    getRetrievalModeForRoute: (routeKey: string) => RetrievalMode;
    getRouteFocusMetadata: (routeKey: string) => RouteFocusMetadata | null;
    registerFocusedRoute: (routeKey: string) => void;
    unregisterFocusedRoute: (routeKey: string) => void;
    wasRecentKeyboardInteraction: () => boolean;
    clearKeyboardInteractionFlag: () => void;
    getCapturedAnchorElement: () => HTMLElement | null;
    cleanupRemovedRoutes: (state: State) => void;
    setElementQueryStrategyForTests: (queryStrategy?: (tagNameSelector: string) => readonly HTMLElement[]) => void;
    getInteractionProvenanceForTests: () => InteractionProvenance | null;
};

export type {
    ElementRefCandidateMetadata,
    IdentifierCandidateMetadata,
    InteractionProvenance,
    InteractionTrigger,
    InteractionType,
    NavigationFocusManagerModule,
    RetrievalMode,
    RouteFocusMetadata,
};
