import type {NavigationState, PartialState} from '@react-navigation/native';

/**
 * Recursively inserts `stateToInsert` below `accumulatedState` in the
 * navigation tree. At each level, if the first route names match we recurse
 * deeper; otherwise the route from `stateToInsert` is prepended and the index
 * is shifted so the previously focused route stays focused.
 *
 * @param accumulatedState - The accumulated state to insert the new state below.
 * @param stateToInsert - The state to insert below the accumulated state.
 * @returns The new state with the new state inserted below the accumulated state.
 */
function insertStateBelow(accumulatedState: PartialState<NavigationState>, stateToInsert: PartialState<NavigationState>): PartialState<NavigationState> {
    const routeToInsert = stateToInsert.routes.at(0);
    if (!routeToInsert) {
        return accumulatedState;
    }

    const existingRoute = accumulatedState.routes.at(0);
    if (!existingRoute) {
        return stateToInsert;
    }

    // Same navigator at this level - recurse deeper to find the divergence point.
    if (routeToInsert.name === existingRoute.name) {
        const existingNestedState = existingRoute.state;
        const nestedStateToInsert = routeToInsert.state;

        if (existingNestedState && nestedStateToInsert) {
            const mergedNestedState = insertStateBelow(existingNestedState, nestedStateToInsert);
            const updatedRoute = {...existingRoute, state: mergedNestedState};
            const updatedRoutes = [updatedRoute, ...accumulatedState.routes.slice(1)];
            return {
                ...accumulatedState,
                routes: updatedRoutes,
                index: accumulatedState.index ?? accumulatedState.routes.length - 1,
            };
        }

        return accumulatedState;
    }

    // Different navigator - this is the divergence point.
    // Prepend the new route and shift the index so the previously focused route stays focused.
    const updatedRoutes = [routeToInsert, ...accumulatedState.routes];
    return {
        ...accumulatedState,
        routes: updatedRoutes,
        index: (accumulatedState.index ?? accumulatedState.routes.length - 1) + 1,
    };
}

export default insertStateBelow;
