/**
 * Works out where a preview press was made from, so the report route it opens can be built from the press-time route.
 *
 * A press made while the report is already open (a second card, or "View", inside the cascade window) carries that
 * report's own route, `backTo` included. Reusing that `backTo` rebuilds the identical route instead of nesting the
 * report inside itself, and tells the caller there is nothing left to push.
 */
function resolvePressOrigin(routeAtPress: string, reportPath: string) {
    const [path, query] = routeAtPress.split('?');
    // `Navigation.getActiveRoute()` returns a leading slash that the route builders never emit.
    const pressedPath = path?.startsWith('/') ? path.substring(1) : path;
    if (pressedPath !== reportPath) {
        return {wasPressedFromReport: false, backTo: routeAtPress};
    }
    return {wasPressedFromReport: true, backTo: new URLSearchParams(query).get('backTo') ?? ''};
}

export default resolvePressOrigin;
