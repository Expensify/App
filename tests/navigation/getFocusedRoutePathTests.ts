import type {NavigationState, PartialState} from '@react-navigation/native';
import getFocusedRoutePath, {getFocusedRouteAtCurrentLevel} from '@libs/Navigation/helpers/getFocusedRoutePath';

function buildState(routes: Array<{name: string; state?: PartialState<NavigationState>}>, index?: number): PartialState<NavigationState> {
    return {routes, index} as PartialState<NavigationState>;
}

describe('getFocusedRoutePath', () => {
    it('returns the route at the explicit index, or the last route when index is omitted', () => {
        const stateWithIndex = buildState([{name: 'First'}, {name: 'Second'}], 1);
        expect(getFocusedRouteAtCurrentLevel(stateWithIndex)).toMatchObject({name: 'Second'});
        expect(getFocusedRoutePath(stateWithIndex)).toEqual([{name: 'Second'}]);

        const stateWithoutIndex = buildState([{name: 'First'}, {name: 'Second'}, {name: 'Third'}]);
        expect(getFocusedRouteAtCurrentLevel(stateWithoutIndex)).toMatchObject({name: 'Third'});
        expect(getFocusedRoutePath(stateWithoutIndex)).toEqual([{name: 'Third'}]);
    });

    it('returns the focused route ancestry', () => {
        const state = buildState([
            {
                name: 'Root',
                state: buildState([
                    {
                        name: 'Middle',
                        state: buildState([{name: 'Leaf'}]),
                    },
                ]),
            },
        ]);

        expect(getFocusedRoutePath(state).map((route) => route.name)).toEqual(['Root', 'Middle', 'Leaf']);
    });

    it('stops at the requested focused route', () => {
        const state = buildState([
            {
                name: 'Root',
                state: buildState([
                    {
                        name: 'Middle',
                        state: buildState([{name: 'Leaf'}]),
                    },
                ]),
            },
        ]);

        expect(getFocusedRoutePath(state, (route) => route.name === 'Middle').map((route) => route.name)).toEqual(['Root', 'Middle']);
    });

    it('returns an empty path when routes array is empty', () => {
        const state = buildState([]);

        expect(getFocusedRouteAtCurrentLevel(state)).toBeUndefined();
        expect(getFocusedRoutePath(state)).toEqual([]);
    });
});
