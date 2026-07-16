import type {Route} from '@src/ROUTES';

/**
 * Reporting a card lost from a card deep-linked by OldDot (settings/card/:cardID) deletes the original card and lands the
 * user on the replacement card's route. The cardID segment changes, so a plain comparison would no longer match the initial
 * URL. Normalize the cardID segment so the same card-detail screen still counts as a match regardless of which card is shown.
 */
function normalizeDomainCardDetailRoute(path: string): string {
    return path.replace(/(^|\/)settings\/card\/[^/?]+/, '$1settings/card/:cardID');
}

/**
 * Whether the initial URL that launched NewDot still matches the currently active route. Used to decide whether the
 * HybridApp single-entry back handoff should fire (i.e. the user is still on the screen OldDot deep-linked into).
 */
function doesInitialURLMatchActiveRoute(initialURL: Route | null, activeRouteWithoutParams: string): boolean {
    const initialURLWithoutParams = initialURL?.replaceAll(/\?.*/g, '');

    if (!initialURLWithoutParams) {
        return false;
    }

    return normalizeDomainCardDetailRoute(initialURLWithoutParams).endsWith(normalizeDomainCardDetailRoute(activeRouteWithoutParams));
}

export default doesInitialURLMatchActiveRoute;
