import {takePreMountedFullscreenForReveal} from '@libs/Navigation/helpers/preMountBuffer';
import {getLiveWideTabPreMountRouteKey, isStaleWideTabPreMountRouteKey} from '@libs/Navigation/helpers/wideTabPreMountRouteKey';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

import {DeviceEventEmitter} from 'react-native';

type MockRoute = {key: string; name: string; state?: PartialState<NavigationState> | MockTabState; params?: {reportID?: string}};
type MockTabState = {key: string; index: number; routes: MockRoute[]; routeNames: string[]; stale: false; type?: string; preloadedRouteKeys?: string[]};
type MockAction = {
    type: string;
    target?: string;
    payload?: {routes?: MockRoute[]; index?: number; shouldInsertPreMountBuffer?: boolean; preMountedRouteKey?: string; key?: string; preloadedRouteKeys?: string[]};
};

let mockRootState: {key: string; routes: MockRoute[]; index: number; routeNames?: string[]; stale?: boolean} | undefined;
const mockDispatch = jest.fn<void, [MockAction]>();
let mockStateListener: (() => void) | undefined;

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        isReady: () => true,
        getRootState: () => mockRootState,
        getState: () => mockRootState,
        dispatch: (action: MockAction) => mockDispatch(action),
        get current() {
            return {
                getRootState: () => mockRootState,
                dispatch: mockDispatch,
                addListener: (event: string, cb: () => void) => {
                    if (event !== 'state') {
                        return () => undefined;
                    }
                    mockStateListener = cb;
                    return () => {
                        mockStateListener = undefined;
                    };
                },
            };
        },
    },
}));

let mockIsNarrowLayout = true;
jest.mock('@libs/getIsNarrowLayout', () => ({
    __esModule: true,
    default: () => mockIsNarrowLayout,
}));

let mockPlatform = 'web';
jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: () => mockPlatform,
}));

let mockStateFromPathRoutes: MockRoute[] = [];
jest.mock('@libs/Navigation/helpers/getStateFromPath', () => ({
    __esModule: true,
    default: () => ({routes: mockStateFromPathRoutes}),
}));

let mockOriginalTabRoute: MockRoute | undefined;
const mockClearPreInsertedOriginalTabRoute = jest.fn(() => {
    mockOriginalTabRoute = undefined;
});
jest.mock('@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers', () => ({
    __esModule: true,
    ...jest.requireActual<Record<string, unknown>>('@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers'),
    getPreInsertedOriginalTabRoute: () => mockOriginalTabRoute,
    clearPreInsertedOriginalTabRoute: () => mockClearPreInsertedOriginalTabRoute(),
}));

const RHP_KEY = 'rhp-1';
const DEST_KEY = 'dest-1';
const BUFFER_KEY = `pre-mount-buffer-${RHP_KEY}`;
const ORIGIN_KEY = 'origin-1';

function setRootState(routes: MockRoute[]) {
    mockRootState = {key: 'root', routes, index: routes.length - 1, routeNames: routes.map((r) => r.name), stale: false};
}

describe('Navigation pre-mount buffer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsNarrowLayout = true;
        mockPlatform = 'web';
        mockOriginalTabRoute = undefined;
        mockStateFromPathRoutes = [{key: 'target', name: NAVIGATORS.WORKSPACE_NAVIGATOR}];
        setRootState([
            {key: ORIGIN_KEY, name: SCREENS.REPORT},
            {key: RHP_KEY, name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
        ]);
    });

    afterEach(() => {
        // helpers/preMountBuffer.ts tracks the buffer transaction / pre-insert flag as module-level state with
        // no exported reset, so a dirty flag from one test silently no-ops the next test's pre-insert.
        if (!Navigation.getIsFullscreenPreInsertedUnderRHP()) {
            return;
        }
        Navigation.clearFullscreenPreInsertedFlag();
    });

    function preInsertAndCaptureBuffer() {
        // Simulate the reducer's effect: destination pushed under a fresh Buffer, RHP stays on top.
        mockDispatch.mockImplementationOnce(() => {
            setRootState([
                {key: ORIGIN_KEY, name: SCREENS.REPORT},
                {key: DEST_KEY, name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                {key: BUFFER_KEY, name: SCREENS.PRE_MOUNT_BUFFER},
                {key: RHP_KEY, name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
            ]);
        });
        // eslint-disable-next-line rulesdir/no-direct-pre-insert-fullscreen-under-rhp -- unit-testing the guarded function itself, not a production call site
        Navigation.preInsertFullscreenUnderRHP(ROUTES.HOME);
    }

    it('inserts a pre-mount buffer directly under the RHP when pre-inserting a fullscreen destination', () => {
        // Given a narrow layout with an RHP above the current fullscreen route
        // When a fullscreen destination is speculatively inserted beneath the RHP
        preInsertAndCaptureBuffer();

        // Then a buffer protects the origin from becoming visible during swipe dismissal
        expect(Navigation.getIsFullscreenPreInsertedUnderRHP()).toBe(true);
        expect(mockRootState?.routes.map((r) => r.name)).toEqual([SCREENS.REPORT, NAVIGATORS.WORKSPACE_NAVIGATOR, SCREENS.PRE_MOUNT_BUFFER, NAVIGATORS.RIGHT_MODAL_NAVIGATOR]);
    });

    it('does not insert a pre-mount buffer when the focused RHP inner flow can handle the native swipe', () => {
        // Given an RHP with inner navigation history that can consume the swipe gesture
        setRootState([
            {key: ORIGIN_KEY, name: SCREENS.REPORT},
            {
                key: RHP_KEY,
                name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                state: {
                    index: 0,
                    routes: [
                        {
                            key: 'rhp-stack',
                            name: 'RHPStack',
                            state: {
                                index: 1,
                                routes: [
                                    {key: 'inner-1', name: 'InnerOne'},
                                    {key: 'inner-2', name: 'InnerTwo'},
                                ],
                            },
                        },
                    ],
                },
            },
        ]);
        mockDispatch.mockImplementationOnce((action) => {
            expect(action).toEqual(expect.objectContaining({payload: expect.objectContaining({shouldInsertPreMountBuffer: false})}));
            setRootState([
                {key: ORIGIN_KEY, name: SCREENS.REPORT},
                {key: DEST_KEY, name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                {key: RHP_KEY, name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
            ]);
        });

        // When a fullscreen destination is pre-inserted beneath that nested flow
        // eslint-disable-next-line rulesdir/no-direct-pre-insert-fullscreen-under-rhp -- unit-testing the guarded function itself, not a production call site
        Navigation.preInsertFullscreenUnderRHP(ROUTES.HOME);

        // Then no buffer is needed because the inner flow owns gesture recovery
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockRootState?.routes.some((route) => route.name === SCREENS.PRE_MOUNT_BUFFER)).toBe(false);
    });

    it('defaults to inserting a pre-mount buffer when the topmost route is not the RHP', () => {
        // Given navigation state where the RHP topology cannot be inspected
        setRootState([{key: ORIGIN_KEY, name: SCREENS.REPORT}]);
        mockDispatch.mockImplementationOnce((action) => {
            expect(action).toEqual(expect.objectContaining({payload: expect.objectContaining({shouldInsertPreMountBuffer: true})}));
            setRootState([
                {key: ORIGIN_KEY, name: SCREENS.REPORT},
                {key: DEST_KEY, name: NAVIGATORS.WORKSPACE_NAVIGATOR},
            ]);
        });

        // When a fullscreen destination is pre-inserted
        // eslint-disable-next-line rulesdir/no-direct-pre-insert-fullscreen-under-rhp -- unit-testing the guarded function itself, not a production call site
        Navigation.preInsertFullscreenUnderRHP(ROUTES.HOME);

        // Then the safer buffered behavior is requested because swipe handling is unknown
        expect(mockDispatch).toHaveBeenCalledTimes(1);
    });

    it('confirm: clearFullscreenPreInsertedFlag strips only the Buffer route, keeping the destination', () => {
        // Given a live speculative destination protected by a buffer
        preInsertAndCaptureBuffer();
        mockDispatch.mockClear();

        // When submission confirms that the destination should remain mounted
        Navigation.clearFullscreenPreInsertedFlag();

        // Then only the temporary buffer is removed because the destination is now valid
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        const resetAction = mockDispatch.mock.calls.at(0)?.at(0);
        expect(resetAction?.type).toBe('RESET');
        expect(resetAction?.payload?.routes?.map((r) => r.key)).toEqual([ORIGIN_KEY, DEST_KEY, RHP_KEY]);
        expect(Navigation.getIsFullscreenPreInsertedUnderRHP()).toBe(false);
    });

    it('cancel: removePreInsertedFullscreenIfNeeded strips both the Buffer and the speculative destination', () => {
        // Given a live speculative destination protected by a buffer
        preInsertAndCaptureBuffer();
        mockDispatch.mockClear();

        // When submission is canceled before the destination becomes valid
        Navigation.removePreInsertedFullscreenIfNeeded();

        // Then all speculative routes are removed so navigation returns to its origin
        // First dispatch strips the Buffer only (removeBufferRouteOnly), second removes the destination itself.
        expect(mockDispatch).toHaveBeenCalledTimes(2);
        const bufferStripAction = mockDispatch.mock.calls.at(0)?.at(0);
        expect(bufferStripAction?.payload?.routes?.map((r) => r.key)).toEqual([ORIGIN_KEY, DEST_KEY, RHP_KEY]);

        const removeFullscreenAction = mockDispatch.mock.calls.at(1)?.at(0);
        expect(removeFullscreenAction?.type).toBe(CONST.NAVIGATION.ACTION_TYPE.REMOVE_FULLSCREEN_UNDER_RHP);
        expect(Navigation.getIsFullscreenPreInsertedUnderRHP()).toBe(false);
    });

    it('cancel: removePreInsertedFullscreenIfNeeded also tears down when the Share modal, not the RHP, hosts the buffer', () => {
        // Given a Submit-tab destination pre-inserted under the Share modal (#100767)
        const SHARE_KEY = 'share-1';
        setRootState([
            {key: ORIGIN_KEY, name: SCREENS.REPORT},
            {key: SHARE_KEY, name: NAVIGATORS.SHARE_MODAL_NAVIGATOR},
        ]);
        mockDispatch.mockImplementationOnce(() => {
            setRootState([
                {key: ORIGIN_KEY, name: SCREENS.REPORT},
                {key: DEST_KEY, name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                {key: `pre-mount-buffer-${SHARE_KEY}`, name: SCREENS.PRE_MOUNT_BUFFER},
                {key: SHARE_KEY, name: NAVIGATORS.SHARE_MODAL_NAVIGATOR},
            ]);
        });
        // eslint-disable-next-line rulesdir/no-direct-pre-insert-fullscreen-under-rhp -- unit-testing the guarded function itself, not a production call site
        Navigation.preInsertFullscreenUnderRHP(ROUTES.HOME);
        mockDispatch.mockClear();

        // When the user backs out of the Submit confirm page while the Share modal is still on top
        Navigation.removePreInsertedFullscreenIfNeeded();

        // Then the buffer and the speculative destination are removed, so a later Share reveal cannot inherit them
        expect(mockDispatch).toHaveBeenCalledTimes(2);
        const bufferStripAction = mockDispatch.mock.calls.at(0)?.at(0);
        expect(bufferStripAction?.payload?.routes?.map((r) => r.key)).toEqual([ORIGIN_KEY, DEST_KEY, SHARE_KEY]);
        const removeFullscreenAction = mockDispatch.mock.calls.at(1)?.at(0);
        expect(removeFullscreenAction?.type).toBe(CONST.NAVIGATION.ACTION_TYPE.REMOVE_FULLSCREEN_UNDER_RHP);
        expect(Navigation.getIsFullscreenPreInsertedUnderRHP()).toBe(false);
    });

    it('dismissModalWithReport clears the live buffer when dismissing to the already topmost report', () => {
        // Given a buffered destination above the report that dismissal targets
        const reportID = 'report-1';
        preInsertAndCaptureBuffer();
        setRootState([
            {
                key: ORIGIN_KEY,
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    index: 0,
                    routes: [
                        {
                            key: 'reports-split',
                            name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                            state: {index: 0, routes: [{key: 'report-screen', name: SCREENS.REPORT, params: {reportID}}]},
                        },
                    ],
                },
            },
            {key: DEST_KEY, name: NAVIGATORS.WORKSPACE_NAVIGATOR},
            {key: BUFFER_KEY, name: SCREENS.PRE_MOUNT_BUFFER},
            {key: RHP_KEY, name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
        ]);
        mockDispatch.mockClear();

        // When the modal dismisses to a report already visible in the tab state
        Navigation.dismissModalWithReport({reportID});

        // Then the stale buffer is cleared because no speculative transition remains
        expect(Navigation.getIsFullscreenPreInsertedUnderRHP()).toBe(false);
        const bufferStripAction = mockDispatch.mock.calls.at(0)?.at(0);
        expect(bufferStripAction?.payload?.routes?.map((route) => route.key)).toEqual([ORIGIN_KEY, DEST_KEY, RHP_KEY]);
    });

    it('native swipe-dismiss while the buffer is live atomically strips the destination and Buffer, restoring the origin', () => {
        // Given a live buffered transaction whose RHP disappears outside confirm or cancel
        preInsertAndCaptureBuffer();
        mockDispatch.mockClear();
        const restoreAnimationSpy = jest.spyOn(DeviceEventEmitter, 'emit');

        // RHP got removed by something other than our own confirm/cancel path (native gesture, predictive-back).
        setRootState([
            {key: ORIGIN_KEY, name: SCREENS.REPORT},
            {key: DEST_KEY, name: NAVIGATORS.WORKSPACE_NAVIGATOR},
            {key: BUFFER_KEY, name: SCREENS.PRE_MOUNT_BUFFER},
        ]);
        // When the navigation listener observes the native swipe dismissal
        mockStateListener?.();

        // Then origin restoration is atomic so no speculative screen can flash
        expect(restoreAnimationSpy).toHaveBeenCalledWith(CONST.MODAL_EVENTS.RESTORE_RHP_ANIMATION);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        const resetAction = mockDispatch.mock.calls.at(0)?.at(0);
        expect(resetAction?.payload?.routes?.map((r) => r.key)).toEqual([ORIGIN_KEY]);
        expect(Navigation.getIsFullscreenPreInsertedUnderRHP()).toBe(false);

        restoreAnimationSpy.mockRestore();
    });

    it('RHP-closed listener is a no-op while the RHP route is still present', () => {
        // Given a buffered transaction whose RHP remains mounted
        preInsertAndCaptureBuffer();
        mockDispatch.mockClear();

        // When an unrelated navigation state update reaches the dismissal listener
        mockStateListener?.();

        // Then recovery is skipped because the protected transition is still active
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('tab-switch mode: RHP-closed listener restores the original tab route instead of popping a pushed destination', () => {
        // Given a buffered tab switch that replaced the original tab route beneath the RHP
        mockOriginalTabRoute = {key: 'tab-origin', name: NAVIGATORS.TAB_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.INBOX}]} as PartialState<NavigationState>};
        mockStateFromPathRoutes = [{key: 'target', name: NAVIGATORS.TAB_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.SEARCH.ROOT}]} as PartialState<NavigationState>}];

        const TAB_KEY = 'tab-1';
        setRootState([
            {key: TAB_KEY, name: NAVIGATORS.TAB_NAVIGATOR},
            {key: RHP_KEY, name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
        ]);

        mockDispatch.mockImplementationOnce(() => {
            setRootState([
                {key: TAB_KEY, name: NAVIGATORS.TAB_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.SEARCH.ROOT}]} as PartialState<NavigationState>},
                {key: BUFFER_KEY, name: SCREENS.PRE_MOUNT_BUFFER},
                {key: RHP_KEY, name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
            ]);
        });
        // eslint-disable-next-line rulesdir/no-direct-pre-insert-fullscreen-under-rhp -- unit-testing the guarded function itself, not a production call site
        Navigation.preInsertFullscreenUnderRHP(ROUTES.HOME);
        mockDispatch.mockClear();

        // RHP dismissed externally while the tab-switch buffer transaction is still live.
        setRootState([
            {key: TAB_KEY, name: NAVIGATORS.TAB_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.SEARCH.ROOT}]} as PartialState<NavigationState>},
            {key: BUFFER_KEY, name: SCREENS.PRE_MOUNT_BUFFER},
        ]);
        // When the RHP is dismissed outside the normal completion paths
        mockStateListener?.();

        // Then the original tab is restored because there is no pushed route to pop
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        const resetAction = mockDispatch.mock.calls.at(0)?.at(0);
        const restoredTabRoute = resetAction?.payload?.routes?.find((r) => r.key === TAB_KEY);
        expect(restoredTabRoute).toEqual(mockOriginalTabRoute);
        expect(resetAction?.payload?.routes?.some((r) => r.key === BUFFER_KEY)).toBe(false);
    });

    it('tab-switch mode falls back to stripping the Buffer when the original tab route was cleared', () => {
        // Given a buffered tab switch whose saved origin is no longer available
        mockOriginalTabRoute = {key: 'tab-origin', name: NAVIGATORS.TAB_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.INBOX}]} as PartialState<NavigationState>};
        mockStateFromPathRoutes = [{key: 'target', name: NAVIGATORS.TAB_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.SEARCH.ROOT}]} as PartialState<NavigationState>}];

        const TAB_KEY = 'tab-1';
        const switchedTabRoute = {key: TAB_KEY, name: NAVIGATORS.TAB_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.SEARCH.ROOT}]} as PartialState<NavigationState>};
        setRootState([
            {key: TAB_KEY, name: NAVIGATORS.TAB_NAVIGATOR},
            {key: RHP_KEY, name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
        ]);
        mockDispatch.mockImplementationOnce(() => {
            setRootState([switchedTabRoute, {key: BUFFER_KEY, name: SCREENS.PRE_MOUNT_BUFFER}, {key: RHP_KEY, name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}]);
        });
        // eslint-disable-next-line rulesdir/no-direct-pre-insert-fullscreen-under-rhp -- unit-testing the guarded function itself, not a production call site
        Navigation.preInsertFullscreenUnderRHP(ROUTES.HOME);
        mockDispatch.mockClear();
        mockOriginalTabRoute = undefined;

        setRootState([switchedTabRoute, {key: BUFFER_KEY, name: SCREENS.PRE_MOUNT_BUFFER}]);
        // When external dismissal triggers recovery
        mockStateListener?.();

        // Then only the buffer is stripped because the current tab cannot be safely replaced
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        const resetAction = mockDispatch.mock.calls.at(0)?.at(0);
        expect(resetAction?.payload?.routes).toEqual([switchedTabRoute]);
    });

    const TAB_STATE_KEY = 'tab-state';

    function makeStack(key: string, routes: MockRoute[], index = routes.length - 1): MockTabState {
        return {key, index, routes, routeNames: [SCREENS.INBOX, SCREENS.REPORT], stale: false, type: 'stack'};
    }

    /** Wide root state: [TAB_NAVIGATOR, RHP], the tab navigator holding Home and a visited Reports tab. */
    function setWideTabState(focusedTab: string, reportsRoutes: MockRoute[]) {
        const tabState: MockTabState = {
            key: TAB_STATE_KEY,
            index: focusedTab === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR ? 1 : 0,
            routes: [
                {key: 'home-key', name: SCREENS.HOME},
                {key: 'reports-key', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: makeStack('reports-stack', reportsRoutes)},
            ],
            routeNames: [SCREENS.HOME, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR],
            stale: false,
            type: 'tab',
            preloadedRouteKeys: [],
        };
        setRootState([
            {key: 'tab-nav', name: NAVIGATORS.TAB_NAVIGATOR, state: tabState},
            {key: RHP_KEY, name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
        ]);
    }

    function isMockTabState(state: unknown): state is MockTabState {
        return typeof state === 'object' && state !== null && 'key' in state && 'routes' in state;
    }

    function getWideTabState() {
        const state = mockRootState?.routes.at(0)?.state;
        return isMockTabState(state) ? state : undefined;
    }

    function getReportsStack() {
        const state = getWideTabState()?.routes.find((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR)?.state;
        return isMockTabState(state) ? state : undefined;
    }

    function mockTabTargetFromPath(reportID = '42') {
        mockStateFromPathRoutes = [
            {
                key: 'target',
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {index: 0, routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.REPORT, params: {reportID}}]}}]},
            },
        ];
    }

    /** Simulates the tab router: a RESET aimed at the tab navigator replaces its state. */
    function applyTabResets() {
        mockDispatch.mockImplementation((action) => {
            if (action.type !== CONST.NAVIGATION.ACTION_TYPE.RESET || action.target !== TAB_STATE_KEY || !mockRootState || !isMockTabState(action.payload)) {
                return;
            }
            const [tabRoute, ...rest] = mockRootState.routes;
            setRootState([{...tabRoute, state: action.payload}, ...rest]);
        });
    }

    function preMountOnWide(focusedTab: string = SCREENS.HOME, reportsRoutes: MockRoute[] = [{key: 'inbox-key', name: SCREENS.INBOX}]) {
        mockIsNarrowLayout = false;
        setWideTabState(focusedTab, reportsRoutes);
        mockTabTargetFromPath();
        applyTabResets();
        // eslint-disable-next-line rulesdir/no-direct-pre-insert-fullscreen-under-rhp -- unit-testing the guarded function itself, not a production call site
        Navigation.preInsertFullscreenUnderRHP(ROUTES.REPORT_WITH_ID.getRoute('42'));
    }

    it('wide layout: pre-mounts the destination on top of its covered tab and keeps that tab preloaded', () => {
        // Given a wide layout on Home with a visited Reports tab
        // When report 42 is pre-inserted
        preMountOnWide();

        // Then the report sits on top of the Reports stack inside the one tab navigator, and Home stays focused
        const preMountedRouteKey = Navigation.getPreMountedFullscreenRouteKey(ROUTES.REPORT_WITH_ID.getRoute('42'));
        expect(getReportsStack()?.routes.map((route) => route.key)).toEqual(['inbox-key', preMountedRouteKey]);
        expect(getWideTabState()?.index).toBe(0);
        expect(getWideTabState()?.preloadedRouteKeys).toEqual(['reports-key']);
        expect(mockRootState?.routes.map((route) => route.name)).toEqual([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR]);
        expect(getLiveWideTabPreMountRouteKey()).toBe(preMountedRouteKey);
        expect(Navigation.getPreInsertedFullscreenRouteName()).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
    });

    it('wide layout: pre-mounts a destination in the focused tab directly under the current screen', () => {
        // Given the Reports tab focused on report A
        // When report 42 is pre-inserted
        preMountOnWide(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, [
            {key: 'inbox-key', name: SCREENS.INBOX},
            {key: 'a-key', name: SCREENS.REPORT, params: {reportID: 'A'}},
        ]);

        // Then report A stays on top and visible, with the destination mounted right under it
        const preMountedRouteKey = Navigation.getPreMountedFullscreenRouteKey();
        expect(getReportsStack()?.routes.map((route) => route.key)).toEqual(['inbox-key', preMountedRouteKey, 'a-key']);
        expect(getReportsStack()?.index).toBe(2);
        expect(getWideTabState()?.preloadedRouteKeys).toEqual([]);
    });

    it('wide layout: skips the pre-mount when the destination is the screen already shown', () => {
        // Given the Reports tab focused on report 42 itself
        // When report 42 is pre-inserted
        preMountOnWide(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, [
            {key: 'inbox-key', name: SCREENS.INBOX},
            {key: 'r42-key', name: SCREENS.REPORT, params: {reportID: '42'}},
        ]);

        // Then nothing is dispatched, because the destination is already on screen
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(Navigation.getIsFullscreenPreInsertedUnderRHP()).toBe(false);
    });

    it('wide layout: the pre-mounted key only matches the route it was built for', () => {
        // Given a wide pre-mount for report 42
        preMountOnWide();

        // When another route asks for the key
        // Then it gets nothing, so revealing a different destination never shows the wrong screen
        expect(Navigation.getPreMountedFullscreenRouteKey(ROUTES.REPORT_WITH_ID.getRoute('43'))).toBeUndefined();
        expect(Navigation.getPreMountedFullscreenRouteKey()).toBe(getLiveWideTabPreMountRouteKey());
    });

    it('wide layout: cancel takes the pre-mount out and drops the preload it added', () => {
        // Given a wide pre-mount on top of the covered Reports tab
        preMountOnWide();
        const preMountedRouteKey = Navigation.getPreMountedFullscreenRouteKey();
        const restoreAnimationSpy = jest.spyOn(DeviceEventEmitter, 'emit');

        // When the user backs out without submitting
        Navigation.removePreInsertedFullscreenIfNeeded();

        // Then the Reports tab is back to how it was, and a later browser forward restoring the pre-mount sees it as stale
        expect(getReportsStack()?.routes.map((route) => route.key)).toEqual(['inbox-key']);
        expect(getWideTabState()?.preloadedRouteKeys).toEqual([]);
        expect(restoreAnimationSpy).not.toHaveBeenCalled();
        expect(Navigation.getIsFullscreenPreInsertedUnderRHP()).toBe(false);
        expect(getLiveWideTabPreMountRouteKey()).toBeUndefined();
        expect(isStaleWideTabPreMountRouteKey(preMountedRouteKey)).toBe(true);
        restoreAnimationSpy.mockRestore();
    });

    it('wide layout: clearFullscreenPreInsertedFlag drops a pre-mount that was never revealed', () => {
        // Given a wide pre-mount, which only a reveal can show, so a plain dismiss after clearing would leave it hidden in the stack
        preMountOnWide();

        // When a caller clears the flag without revealing (e.g. the dismiss-first submit path)
        Navigation.clearFullscreenPreInsertedFlag();

        // Then the pre-mounted screen is removed and nothing is tracked anymore
        expect(getReportsStack()?.routes.map((route) => route.key)).toEqual(['inbox-key']);
        expect(Navigation.getPreMountedFullscreenRouteKey()).toBeUndefined();
    });

    it('wide layout: revealing hands the pre-mount to REPLACE and stops treating it as a pre-mount', () => {
        // Given a wide pre-mount for report 42
        preMountOnWide();
        const preMountedRouteKey = Navigation.getPreMountedFullscreenRouteKey() ?? '';
        mockDispatch.mockClear();
        const rafSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
            callback(0);
            return 0;
        });

        // When that route is revealed
        Navigation.revealRouteBeforeDismissingModal(ROUTES.REPORT_WITH_ID.getRoute('42'));

        // Then REPLACE gets the key to reuse, and the revealed screen is a regular one that browser history may restore
        expect(mockDispatch).toHaveBeenCalledWith({
            type: CONST.NAVIGATION.ACTION_TYPE.REPLACE_FULLSCREEN_UNDER_RHP,
            payload: {route: ROUTES.REPORT_WITH_ID.getRoute('42'), preMountedRouteKey},
        });
        expect(getLiveWideTabPreMountRouteKey()).toBeUndefined();
        expect(isStaleWideTabPreMountRouteKey(preMountedRouteKey)).toBe(false);
        rafSpy.mockRestore();
    });

    it('wide layout: taking the pre-mount for a reveal keeps its screen in the stack', () => {
        // Given a wide pre-mount for report 42
        preMountOnWide();
        const preMountedRouteKey = Navigation.getPreMountedFullscreenRouteKey();
        mockDispatch.mockClear();

        // When the reveal of that same route takes it
        const takenRouteKey = takePreMountedFullscreenForReveal(ROUTES.REPORT_WITH_ID.getRoute('42'));

        // Then the key is handed to the reveal and nothing is dispatched, since REPLACE is about to show that screen
        expect(takenRouteKey).toBe(preMountedRouteKey);
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(Navigation.getPreMountedFullscreenRouteKey()).toBeUndefined();
    });

    it('guard: preInsertFullscreenUnderRHP is a no-op on wide layout when the destination is not a tab navigator', () => {
        // Given a wide layout and a destination outside the tab navigator
        mockIsNarrowLayout = false;

        // When speculative fullscreen insertion is requested
        // eslint-disable-next-line rulesdir/no-direct-pre-insert-fullscreen-under-rhp -- unit-testing the guarded function itself, not a production call site
        Navigation.preInsertFullscreenUnderRHP(ROUTES.HOME);

        // Then navigation stays unchanged because only tab destinations can be swapped in later
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(Navigation.getIsFullscreenPreInsertedUnderRHP()).toBe(false);
    });

    it('guard: preInsertFullscreenUnderRHP is a no-op on a repeated call while already pre-inserted', () => {
        // Given an active pre-insert transaction already tracking its recovery state
        preInsertAndCaptureBuffer();
        mockDispatch.mockClear();

        // When another pre-insert is requested before the first one finishes
        // eslint-disable-next-line rulesdir/no-direct-pre-insert-fullscreen-under-rhp -- unit-testing the guarded function itself, not a production call site
        Navigation.preInsertFullscreenUnderRHP(ROUTES.HOME);

        // Then it is ignored so the original recovery snapshot is not overwritten
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('guard: removePreInsertedFullscreenIfNeeded is a no-op when nothing was pre-inserted', () => {
        // Given no active speculative navigation transaction
        const restoreAnimationSpy = jest.spyOn(DeviceEventEmitter, 'emit');

        // When cancellation cleanup is called defensively
        Navigation.removePreInsertedFullscreenIfNeeded();

        // Then navigation and animation stay untouched because there is nothing to restore
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(restoreAnimationSpy).not.toHaveBeenCalled();
        restoreAnimationSpy.mockRestore();
    });

    it('guard: removePreInsertedFullscreenIfNeeded backs off when the RHP is gone and the buffer transaction is still live', () => {
        // Given external dismissal has removed the RHP from a live buffered transaction
        preInsertAndCaptureBuffer();
        setRootState([
            {key: ORIGIN_KEY, name: SCREENS.REPORT},
            {key: DEST_KEY, name: NAVIGATORS.WORKSPACE_NAVIGATOR},
            {key: BUFFER_KEY, name: SCREENS.PRE_MOUNT_BUFFER},
        ]);
        mockDispatch.mockClear();

        // When the normal cancellation path races with listener-based recovery
        Navigation.removePreInsertedFullscreenIfNeeded();

        // Then cancellation backs off so the listener remains the single recovery owner
        expect(mockDispatch).not.toHaveBeenCalled();

        mockStateListener?.();
    });

    it('guard: recoverFromPreMountBuffer is a no-op when the topmost route is not the Buffer screen', () => {
        // Given ordinary navigation state without a stranded topmost buffer
        // When startup recovery checks for an interrupted transition
        Navigation.recoverFromPreMountBuffer();

        // Then navigation remains unchanged because no recovery evidence exists
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('recoverFromPreMountBuffer with a live transaction (app resumed while a buffer route was stranded on top) delegates to the same atomic reset as the native-swipe path', () => {
        // Given app resume exposes a stranded buffer from a still-live transaction
        preInsertAndCaptureBuffer();
        mockDispatch.mockClear();

        // RHP already gone; Buffer is the new topmost route (e.g. app was backgrounded mid-transition).
        setRootState([
            {key: ORIGIN_KEY, name: SCREENS.REPORT},
            {key: DEST_KEY, name: NAVIGATORS.WORKSPACE_NAVIGATOR},
            {key: BUFFER_KEY, name: SCREENS.PRE_MOUNT_BUFFER},
        ]);

        // When buffer recovery runs after the interrupted transition
        Navigation.recoverFromPreMountBuffer();

        // Then the saved origin is restored atomically to avoid showing speculative state
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        const resetAction = mockDispatch.mock.calls.at(0)?.at(0);
        expect(resetAction?.payload?.routes?.map((r) => r.key)).toEqual([ORIGIN_KEY]);
        expect(Navigation.getIsFullscreenPreInsertedUnderRHP()).toBe(false);
    });

    it('recoverFromPreMountBuffer falls back to stripping Buffer + the speculative destination when the transaction itself was lost (e.g. a cold restart)', () => {
        // Given a cold restart retained routes but lost the in-memory recovery transaction
        // No preceding preInsert call: bufferTransaction is not live, simulating a lost/never-captured transaction.
        setRootState([
            {key: ORIGIN_KEY, name: SCREENS.REPORT},
            {key: DEST_KEY, name: NAVIGATORS.WORKSPACE_NAVIGATOR},
            {key: BUFFER_KEY, name: SCREENS.PRE_MOUNT_BUFFER},
        ]);

        // When startup detects the stranded buffer
        Navigation.recoverFromPreMountBuffer();

        // Then it removes both temporary routes because no richer snapshot survives
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        const resetAction = mockDispatch.mock.calls.at(0)?.at(0);
        expect(resetAction?.payload?.routes?.map((r) => r.key)).toEqual([ORIGIN_KEY]);
    });

    it('recoverFromPreMountBuffer fallback restores the original tab route when the stranded buffer came from a tab switch', () => {
        // Given a stranded tab-switch buffer with its original tab snapshot still available
        const TAB_KEY = 'tab-1';
        mockOriginalTabRoute = {key: 'tab-origin', name: NAVIGATORS.TAB_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.INBOX}]} as PartialState<NavigationState>};
        setRootState([
            {key: TAB_KEY, name: NAVIGATORS.TAB_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.SEARCH.ROOT}]} as PartialState<NavigationState>},
            {key: BUFFER_KEY, name: SCREENS.PRE_MOUNT_BUFFER},
        ]);

        // When startup recovery handles the interrupted tab switch
        Navigation.recoverFromPreMountBuffer();

        // Then it restores the saved tab because stripping a pushed destination is insufficient
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        const resetAction = mockDispatch.mock.calls.at(0)?.at(0);
        const restoredTabRoute = resetAction?.payload?.routes?.find((r) => r.key === TAB_KEY);
        expect(restoredTabRoute).toEqual(mockOriginalTabRoute);
        expect(resetAction?.payload?.routes?.some((r) => r.key === BUFFER_KEY)).toBe(false);
        expect(mockClearPreInsertedOriginalTabRoute).toHaveBeenCalledTimes(1);
    });
});
