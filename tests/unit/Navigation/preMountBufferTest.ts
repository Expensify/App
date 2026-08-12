import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

import {DeviceEventEmitter} from 'react-native';

type MockRoute = {key: string; name: string; state?: PartialState<NavigationState>};
type MockAction = {type: string; payload?: {routes: MockRoute[]; index: number}};

let mockRootState: {key: string; routes: MockRoute[]; index: number; routeNames?: string[]; stale?: boolean} | undefined;
const mockDispatch = jest.fn<void, [MockAction]>();
let mockStateListener: (() => void) | undefined;

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        isReady: () => true,
        getRootState: () => mockRootState,
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
        // Navigation.ts tracks the buffer transaction / pre-insert flag as module-level state with
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
        preInsertAndCaptureBuffer();

        expect(Navigation.getIsFullscreenPreInsertedUnderRHP()).toBe(true);
        expect(mockRootState?.routes.map((r) => r.name)).toEqual([SCREENS.REPORT, NAVIGATORS.WORKSPACE_NAVIGATOR, SCREENS.PRE_MOUNT_BUFFER, NAVIGATORS.RIGHT_MODAL_NAVIGATOR]);
    });

    it('confirm: clearFullscreenPreInsertedFlag strips only the Buffer route, keeping the destination', () => {
        preInsertAndCaptureBuffer();
        mockDispatch.mockClear();

        Navigation.clearFullscreenPreInsertedFlag();

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        const resetAction = mockDispatch.mock.calls.at(0)?.at(0);
        expect(resetAction?.type).toBe('RESET');
        expect(resetAction?.payload?.routes.map((r) => r.key)).toEqual([ORIGIN_KEY, DEST_KEY, RHP_KEY]);
        expect(Navigation.getIsFullscreenPreInsertedUnderRHP()).toBe(false);
    });

    it('cancel: removePreInsertedFullscreenIfNeeded strips both the Buffer and the speculative destination', () => {
        preInsertAndCaptureBuffer();
        mockDispatch.mockClear();

        Navigation.removePreInsertedFullscreenIfNeeded();

        // First dispatch strips the Buffer only (removeBufferRouteOnly), second removes the destination itself.
        expect(mockDispatch).toHaveBeenCalledTimes(2);
        const bufferStripAction = mockDispatch.mock.calls.at(0)?.at(0);
        expect(bufferStripAction?.payload?.routes.map((r) => r.key)).toEqual([ORIGIN_KEY, DEST_KEY, RHP_KEY]);

        const removeFullscreenAction = mockDispatch.mock.calls.at(1)?.at(0);
        expect(removeFullscreenAction?.type).toBe(CONST.NAVIGATION.ACTION_TYPE.REMOVE_FULLSCREEN_UNDER_RHP);
        expect(Navigation.getIsFullscreenPreInsertedUnderRHP()).toBe(false);
    });

    it('native swipe-dismiss while the buffer is live atomically strips the destination and Buffer, restoring the origin', () => {
        preInsertAndCaptureBuffer();
        mockDispatch.mockClear();
        const restoreAnimationSpy = jest.spyOn(DeviceEventEmitter, 'emit');

        // RHP got removed by something other than our own confirm/cancel path (native gesture, predictive-back).
        setRootState([
            {key: ORIGIN_KEY, name: SCREENS.REPORT},
            {key: DEST_KEY, name: NAVIGATORS.WORKSPACE_NAVIGATOR},
            {key: BUFFER_KEY, name: SCREENS.PRE_MOUNT_BUFFER},
        ]);
        mockStateListener?.();

        expect(restoreAnimationSpy).toHaveBeenCalledWith(CONST.MODAL_EVENTS.RESTORE_RHP_ANIMATION);
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        const resetAction = mockDispatch.mock.calls.at(0)?.at(0);
        expect(resetAction?.payload?.routes.map((r) => r.key)).toEqual([ORIGIN_KEY]);
        expect(Navigation.getIsFullscreenPreInsertedUnderRHP()).toBe(false);

        restoreAnimationSpy.mockRestore();
    });

    it('tab-switch mode: RHP-closed listener restores the original tab route instead of popping a pushed destination', () => {
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
        mockStateListener?.();

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        const resetAction = mockDispatch.mock.calls.at(0)?.at(0);
        const restoredTabRoute = resetAction?.payload?.routes.find((r) => r.key === TAB_KEY);
        expect(restoredTabRoute).toEqual(mockOriginalTabRoute);
        expect(resetAction?.payload?.routes.some((r) => r.key === BUFFER_KEY)).toBe(false);
    });

    it('guard: preInsertFullscreenUnderRHP is a no-op on wide layout (buffer only guards a swipe gesture that exists on narrow)', () => {
        mockIsNarrowLayout = false;

        // eslint-disable-next-line rulesdir/no-direct-pre-insert-fullscreen-under-rhp -- unit-testing the guarded function itself, not a production call site
        Navigation.preInsertFullscreenUnderRHP(ROUTES.HOME);

        expect(mockDispatch).not.toHaveBeenCalled();
        expect(Navigation.getIsFullscreenPreInsertedUnderRHP()).toBe(false);
    });

    it('guard: preInsertFullscreenUnderRHP is a no-op on a repeated call while already pre-inserted', () => {
        preInsertAndCaptureBuffer();
        mockDispatch.mockClear();

        // eslint-disable-next-line rulesdir/no-direct-pre-insert-fullscreen-under-rhp -- unit-testing the guarded function itself, not a production call site
        Navigation.preInsertFullscreenUnderRHP(ROUTES.HOME);

        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('guard: removePreInsertedFullscreenIfNeeded is a no-op when nothing was pre-inserted', () => {
        const restoreAnimationSpy = jest.spyOn(DeviceEventEmitter, 'emit');

        Navigation.removePreInsertedFullscreenIfNeeded();

        expect(mockDispatch).not.toHaveBeenCalled();
        expect(restoreAnimationSpy).not.toHaveBeenCalled();
        restoreAnimationSpy.mockRestore();
    });

    it('guard: recoverFromPreMountBuffer is a no-op when the topmost route is not the Buffer screen', () => {
        Navigation.recoverFromPreMountBuffer();

        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('recoverFromPreMountBuffer with a live transaction (app resumed while a buffer route was stranded on top) delegates to the same atomic reset as the native-swipe path', () => {
        preInsertAndCaptureBuffer();
        mockDispatch.mockClear();

        // RHP already gone; Buffer is the new topmost route (e.g. app was backgrounded mid-transition).
        setRootState([
            {key: ORIGIN_KEY, name: SCREENS.REPORT},
            {key: DEST_KEY, name: NAVIGATORS.WORKSPACE_NAVIGATOR},
            {key: BUFFER_KEY, name: SCREENS.PRE_MOUNT_BUFFER},
        ]);

        Navigation.recoverFromPreMountBuffer();

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        const resetAction = mockDispatch.mock.calls.at(0)?.at(0);
        expect(resetAction?.payload?.routes.map((r) => r.key)).toEqual([ORIGIN_KEY]);
        expect(Navigation.getIsFullscreenPreInsertedUnderRHP()).toBe(false);
    });

    it('recoverFromPreMountBuffer falls back to stripping Buffer + the speculative destination when the transaction itself was lost (e.g. a cold restart)', () => {
        // No preceding preInsert call: bufferTransaction is not live, simulating a lost/never-captured transaction.
        setRootState([
            {key: ORIGIN_KEY, name: SCREENS.REPORT},
            {key: DEST_KEY, name: NAVIGATORS.WORKSPACE_NAVIGATOR},
            {key: BUFFER_KEY, name: SCREENS.PRE_MOUNT_BUFFER},
        ]);

        Navigation.recoverFromPreMountBuffer();

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        const resetAction = mockDispatch.mock.calls.at(0)?.at(0);
        expect(resetAction?.payload?.routes.map((r) => r.key)).toEqual([ORIGIN_KEY]);
    });

    it('recoverFromPreMountBuffer fallback restores the original tab route when the stranded buffer came from a tab switch', () => {
        const TAB_KEY = 'tab-1';
        mockOriginalTabRoute = {key: 'tab-origin', name: NAVIGATORS.TAB_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.INBOX}]} as PartialState<NavigationState>};
        setRootState([
            {key: TAB_KEY, name: NAVIGATORS.TAB_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.SEARCH.ROOT}]} as PartialState<NavigationState>},
            {key: BUFFER_KEY, name: SCREENS.PRE_MOUNT_BUFFER},
        ]);

        Navigation.recoverFromPreMountBuffer();

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        const resetAction = mockDispatch.mock.calls.at(0)?.at(0);
        const restoredTabRoute = resetAction?.payload?.routes.find((r) => r.key === TAB_KEY);
        expect(restoredTabRoute).toEqual(mockOriginalTabRoute);
        expect(resetAction?.payload?.routes.some((r) => r.key === BUFFER_KEY)).toBe(false);
        expect(mockClearPreInsertedOriginalTabRoute).toHaveBeenCalledTimes(1);
    });
});
