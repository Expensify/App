import type {NavigationAction} from '@react-navigation/native';
import type {GuardResult, NavigationGuard} from './types';

type DiscardChangesScreen = {
    /** Returns whether the screen currently has unsaved changes */
    hasUnsavedChanges: () => boolean;

    /** Called with the blocked action so the screen can show its discard confirmation */
    onBlocked: (action: NavigationAction) => void;
};

type RouteLike = {
    key?: string;
    state?: StateLike;
};

type StateLike = {
    index?: number;
    routes?: RouteLike[];
};

/** Screens with discard-changes confirmation, keyed by route key; populated by `useDiscardChangesConfirmation` on web */
const registeredScreens = new Map<string, DiscardChangesScreen>();

function registerDiscardChangesScreen(routeKey: string, screen: DiscardChangesScreen): () => void {
    registeredScreens.set(routeKey, screen);
    return () => {
        if (registeredScreens.get(routeKey) !== screen) {
            return;
        }
        registeredScreens.delete(routeKey);
    };
}

function isStateLike(value: unknown): value is StateLike {
    return typeof value === 'object' && value !== null && Array.isArray((value as StateLike).routes);
}

/**
 * Returns the first registered dirty screen on `route`'s focused chain (the route itself, then the focused route at each nested level).
 * Hidden siblings are skipped — an ancestor losing focus changes nothing for an already-unfocused screen.
 */
function findDirtyScreenOnFocusedPath(route: RouteLike): DiscardChangesScreen | undefined {
    let current: RouteLike | undefined = route;
    while (current) {
        if (current.key != null) {
            const screen = registeredScreens.get(current.key);
            if (screen?.hasUnsavedChanges()) {
                return screen;
            }
        }
        const childState: StateLike | undefined = current.state;
        current = childState?.routes?.at(childState?.index ?? 0);
    }
    return undefined;
}

/**
 * Finds a registered dirty screen on the focused chain of a route that the reset keeps but unfocuses (e.g. a tab switch changes only `index`).
 * Removed routes are deliberately not checked — those fire react-navigation's `beforeRemove`.
 */
function findDirtyScreenLosingFocus(state: StateLike, nextState: StateLike): DiscardChangesScreen | undefined {
    const routes = state.routes;
    const nextRoutes = nextState.routes;
    if (!routes || !nextRoutes) {
        return undefined;
    }

    if (typeof state.index === 'number' && typeof nextState.index === 'number') {
        const currentFocusedRoute = routes.at(state.index);
        const nextFocusedKey = nextRoutes.at(nextState.index)?.key;
        if (currentFocusedRoute?.key != null && nextFocusedKey != null && currentFocusedRoute.key !== nextFocusedKey && nextRoutes.some((route) => route.key === currentFocusedRoute.key)) {
            const screen = findDirtyScreenOnFocusedPath(currentFocusedRoute);
            if (screen) {
                return screen;
            }
        }
    }

    for (const route of routes) {
        if (route.key == null || !route.state) {
            continue;
        }
        const nextRoute = nextRoutes.find((candidate) => candidate.key === route.key);
        if (!nextRoute?.state) {
            continue;
        }
        const screen = findDirtyScreenLosingFocus(route.state, nextRoute.state);
        if (screen) {
            return screen;
        }
    }

    return undefined;
}

/**
 * Vetoes a `RESET` (browser back on web) that would unfocus a registered dirty screen, BEFORE the state
 * commits — local form state survives and the screen shows its discard confirmation.
 */
const DiscardChangesGuard: NavigationGuard = {
    name: 'DiscardChangesGuard',
    evaluate(state, action): GuardResult {
        if (action.type !== 'RESET' || registeredScreens.size === 0 || !isStateLike(action.payload)) {
            return {type: 'ALLOW'};
        }

        const screen = findDirtyScreenLosingFocus(state, action.payload);
        if (!screen) {
            return {type: 'ALLOW'};
        }

        screen.onBlocked(action);

        // The screen restores the browser entry with `history.go(1)`; `syncBrowserHistory`'s `replaceState` would wipe the back entry's history id and desync `createMemoryHistory`
        return {type: 'BLOCK', reason: 'discard-changes-confirmation', shouldSkipBrowserHistorySync: true};
    },
};

export default DiscardChangesGuard;
export {registerDiscardChangesScreen};
