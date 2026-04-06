/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-return */
import type {NavigationState} from '@react-navigation/native';
import Navigation from '@libs/Navigation/Navigation';

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

// Prevent side-effects from the full Navigation module (Onyx subscriptions, etc.)
jest.mock('react-native-onyx', () => ({
    __esModule: true,
    default: {
        connect: jest.fn(() => ({disconnect: jest.fn()})),
        connectWithoutView: jest.fn(() => ({disconnect: jest.fn()})),
        disconnect: jest.fn(),
    },
}));

jest.mock('react-native', () => ({
    DeviceEventEmitter: {addListener: jest.fn(() => ({remove: jest.fn()})), emit: jest.fn()},
    Dimensions: {get: jest.fn(() => ({width: 1024, height: 768})), addEventListener: jest.fn(() => ({remove: jest.fn()}))},
    InteractionManager: {runAfterInteractions: jest.fn((cb: () => void) => cb())},
    NativeModules: {},
    Platform: {OS: 'web', select: jest.fn((obj: Record<string, unknown>) => obj.default ?? obj.web)},
}));

jest.mock('@libs/telemetry/activeSpans', () => ({
    getSpan: jest.fn(),
    startSpan: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    createNavigationContainerRef: jest.fn(() => ({current: null})),
}));

function buildRoute(key: string, params: Record<string, unknown> = {}, nestedRoutes?: NavigationState['routes']): NavigationState['routes'][number] {
    const route: NavigationState['routes'][number] = {key, name: 'Screen', params} as NavigationState['routes'][number];
    if (nestedRoutes) {
        (route as Record<string, unknown>).state = {routes: nestedRoutes};
    }
    return route;
}

function buildState(routes: NavigationState['routes']): NavigationState {
    return {routes, index: 0, key: 'root', routeNames: [], stale: false, type: 'stack'} as unknown as NavigationState;
}

describe('cleanStaleBackToParam', () => {
    beforeEach(() => {
        mockDispatch.mockClear();
        mockRootState = undefined;
    });

    it('does nothing when navigation ref has no root state', () => {
        mockRootState = undefined;
        Navigation.cleanStaleBackToParam('111', '222');
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('replaces stale backTo param containing the reportActionID', () => {
        const staleBackTo = '/r/111/222';
        mockRootState = buildState([buildRoute('route-1', {backTo: staleBackTo})]);

        Navigation.cleanStaleBackToParam('111', '222');

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'SET_PARAMS',
                payload: {params: {backTo: '/r/111'}},
                source: 'route-1',
            }),
        );
    });

    it('does not touch routes without a matching backTo', () => {
        mockRootState = buildState([buildRoute('route-1', {backTo: '/r/999/888'}), buildRoute('route-2', {someOtherParam: 'value'}), buildRoute('route-3', {})]);

        Navigation.cleanStaleBackToParam('111', '222');
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('walks nested route state trees', () => {
        const nestedRoute = buildRoute('nested-route', {backTo: '/r/111/222'});
        const parentRoute = buildRoute('parent', {}, [nestedRoute]);
        mockRootState = buildState([parentRoute]);

        Navigation.cleanStaleBackToParam('111', '222');

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: {params: {backTo: '/r/111'}},
                source: 'nested-route',
            }),
        );
    });

    it('replaces only the stale segment in a longer backTo URL', () => {
        const backTo = '/search/r/111/222?q=foo';
        mockRootState = buildState([buildRoute('route-1', {backTo})]);

        Navigation.cleanStaleBackToParam('111', '222');

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

        Navigation.cleanStaleBackToParam('111', '222');

        expect(mockDispatch).toHaveBeenCalledTimes(2);
    });
});
