import type {NavigationState, PartialState} from '@react-navigation/native';
import findFocusedRouteWithOnyxTabGuard from '@libs/Navigation/helpers/findFocusedRouteWithOnyxTabGuard';
import {screensWithOnyxTabNavigator as guardSet} from '@libs/Navigation/linkingConfig/config';

jest.mock('@libs/Navigation/linkingConfig/config', () => ({
    screensWithOnyxTabNavigator: new Set<string>(),
}));

function buildState(routes: Array<{name: string; state?: PartialState<NavigationState>}>, index?: number): PartialState<NavigationState> {
    return {routes, index} as PartialState<NavigationState>;
}

describe('findFocusedRouteWithOnyxTabGuard', () => {
    beforeEach(() => {
        guardSet.clear();
    });

    it('should return the only route when there is a single route with no nested state', () => {
        const state = buildState([{name: 'Home'}]);

        expect(findFocusedRouteWithOnyxTabGuard(state)).toMatchObject({name: 'Home'});
    });

    it('should return the route at the explicit index, or the last route when index is omitted', () => {
        const stateWithIndex = buildState([{name: 'First'}, {name: 'Second'}], 1);
        expect(findFocusedRouteWithOnyxTabGuard(stateWithIndex)).toMatchObject({name: 'Second'});

        const stateWithoutIndex = buildState([{name: 'First'}, {name: 'Second'}, {name: 'Third'}]);
        expect(findFocusedRouteWithOnyxTabGuard(stateWithoutIndex)).toMatchObject({name: 'Third'});
    });

    it('should stop recursing and return the route when its name is in the guard set', () => {
        guardSet.add('SplitExpense');

        const state = buildState([
            {
                name: 'SplitExpense',
                state: buildState([{name: 'AmountTab'}]),
            },
        ]);

        const result = findFocusedRouteWithOnyxTabGuard(state);

        expect(result).toMatchObject({name: 'SplitExpense'});
    });

    it('should recurse into nested state when the route name is not in the guard set', () => {
        const state = buildState([
            {
                name: 'Navigator',
                state: buildState([{name: 'LeafScreen'}]),
            },
        ]);

        expect(findFocusedRouteWithOnyxTabGuard(state)).toMatchObject({name: 'LeafScreen'});
    });

    it('should stop at the middle level when the guard triggers there, not at the leaf', () => {
        guardSet.add('MiddleScreen');

        const state = buildState([
            {
                name: 'Root',
                state: buildState([
                    {
                        name: 'MiddleScreen',
                        state: buildState([{name: 'DeepLeaf'}]),
                    },
                ]),
            },
        ]);

        expect(findFocusedRouteWithOnyxTabGuard(state)).toMatchObject({name: 'MiddleScreen'});
    });

    it('should return undefined when routes array is empty', () => {
        const state = buildState([]);

        expect(findFocusedRouteWithOnyxTabGuard(state)).toBeUndefined();
    });
});
