/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-return */
import type {NavigationState} from '@react-navigation/native';
import cleanStaleReportActionBackToParam from '@src/pages/inbox/cleanStaleReportActionBackToParam';

const mockDispatch = jest.fn();
let mockRootState: NavigationState | undefined;

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        get current() {
            return {
                getRootState: () => mockRootState,
                dispatch: (...args: unknown[]) => mockDispatch(...args),
            };
        },
        getRootState: () => mockRootState,
    },
}));

function buildRoute(key: string, params: Record<string, unknown> = {}, nestedRoutes?: NavigationState['routes'], nestedStateKey?: string): NavigationState['routes'][number] {
    const route: NavigationState['routes'][number] = {key, name: 'Screen', params} as NavigationState['routes'][number];
    if (nestedRoutes) {
        (route as Record<string, unknown>).state = {routes: nestedRoutes, key: nestedStateKey ?? `${key}-nav`};
    }
    return route;
}

function buildState(routes: NavigationState['routes']): NavigationState {
    return {routes, index: 0, key: 'root', routeNames: [], stale: false, type: 'stack'} as unknown as NavigationState;
}

describe('cleanStaleReportActionBackToParam', () => {
    beforeEach(() => {
        mockDispatch.mockClear();
        mockRootState = undefined;
    });

    it('does nothing when navigation ref has no root state', () => {
        mockRootState = undefined;
        cleanStaleReportActionBackToParam('111', '222');
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('replaces stale backTo param containing the reportActionID', () => {
        const staleBackTo = '/r/111/222';
        mockRootState = buildState([buildRoute('route-1', {backTo: staleBackTo})]);

        cleanStaleReportActionBackToParam('111', '222');

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'SET_PARAMS',
                payload: {params: {backTo: '/r/111'}},
                source: 'route-1',
                target: 'root',
            }),
        );
    });

    it('does not touch routes without a matching backTo', () => {
        mockRootState = buildState([buildRoute('route-1', {backTo: '/r/999/888'}), buildRoute('route-2', {someOtherParam: 'value'}), buildRoute('route-3', {})]);

        cleanStaleReportActionBackToParam('111', '222');
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('walks nested route state trees', () => {
        const nestedRoute = buildRoute('nested-route', {backTo: '/r/111/222'});
        const parentRoute = buildRoute('parent', {}, [nestedRoute]);
        mockRootState = buildState([parentRoute]);

        cleanStaleReportActionBackToParam('111', '222');

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: {params: {backTo: '/r/111'}},
                source: 'nested-route',
                target: 'parent-nav',
            }),
        );
    });

    it('replaces only the stale segment in a longer backTo URL', () => {
        const backTo = '/search/r/111/222?q=foo';
        mockRootState = buildState([buildRoute('route-1', {backTo})]);

        cleanStaleReportActionBackToParam('111', '222');

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: {params: {backTo: '/search/r/111?q=foo'}},
            }),
        );
    });

    it('handles multiple matching routes at different nesting levels', () => {
        const deepNested = buildRoute('deep', {backTo: '/r/111/222'});
        const mid = buildRoute('mid', {backTo: '/r/111/222'}, [deepNested]);
        mockRootState = buildState([mid]);

        cleanStaleReportActionBackToParam('111', '222');

        expect(mockDispatch).toHaveBeenCalledTimes(2);
    });

    it('does not match when stale segment is a prefix of a longer reportActionID', () => {
        mockRootState = buildState([buildRoute('route-1', {backTo: '/r/111/2225'})]);
        cleanStaleReportActionBackToParam('111', '222');

        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('matches when stale segment is followed by a slash', () => {
        mockRootState = buildState([buildRoute('route-1', {backTo: '/r/111/222/details'})]);
        cleanStaleReportActionBackToParam('111', '222');

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: {params: {backTo: '/r/111/details'}},
            }),
        );
    });
});
