import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

import {DeviceEventEmitter} from 'react-native';

type MockRoute = {key: string; name: string; state?: PartialState<NavigationState>; params?: {reportID?: string}};
type MockAction = {type: string; payload?: {routes?: MockRoute[]; index?: number; shouldInsertPreMountBuffer?: boolean}};

let mockRootState: {key: string; routes: MockRoute[]; index: number; routeNames?: string[]; stale?: boolean} | undefined;
const mockDispatch = jest.fn<void, [MockAction]>();
let mockStateListener: (() => void) | undefined;

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        isReady: () => true,
        getRootState: () => mockRootState,
        getState: () => mockRootState,
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

    it('guard: preInsertFullscreenUnderRHP is a no-op on wide layout (buffer only guards a swipe gesture that exists on narrow)', () => {
        // Given a wide layout without the narrow-screen swipe dismissal risk
        mockIsNarrowLayout = false;

        // When speculative fullscreen insertion is requested
        // eslint-disable-next-line rulesdir/no-direct-pre-insert-fullscreen-under-rhp -- unit-testing the guarded function itself, not a production call site
        Navigation.preInsertFullscreenUnderRHP(ROUTES.HOME);

        // Then navigation stays unchanged because the buffer has no purpose on wide screens
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
