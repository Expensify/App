import {consumePreMountReplaceOutcome} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import {setIsRevealingPreMountedFullscreen, takePreMountedFullscreenForReveal} from '@libs/Navigation/helpers/preMountBuffer';
import runAfterClosingScreenUnmount from '@libs/Navigation/helpers/runAfterClosingScreenUnmount';
import {cancelWideTabPreMount, discardWideTabPreMount, finishWideTabPreMountReveal} from '@libs/Navigation/helpers/wideTabPreMount';
import {setRevealedWideTabPreMountModalRouteKey} from '@libs/Navigation/helpers/wideTabPreMountRouteKey';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {releasePendingSearchWriteFlush} from '@libs/pendingSearchWrite';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';

import type {NavigationState} from '@react-navigation/native';

import createMock from '../../utils/createMock';

const PRE_MOUNTED_ROUTE_KEY = 'pre-mounted-route-key';

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        isReady: jest.fn(() => true),
        getRootState: jest.fn(),
        dispatch: jest.fn(),
        current: {dispatch: jest.fn()},
    },
}));

jest.mock('@libs/Navigation/helpers/preMountBuffer', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/Navigation/helpers/preMountBuffer'),
    takePreMountedFullscreenForReveal: jest.fn(),
    setIsRevealingPreMountedFullscreen: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/wideTabPreMount', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/Navigation/helpers/wideTabPreMount'),
    cancelWideTabPreMount: jest.fn(),
    discardWideTabPreMount: jest.fn(),
    finishWideTabPreMountReveal: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/wideTabPreMountRouteKey', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/Navigation/helpers/wideTabPreMountRouteKey'),
    setRevealedWideTabPreMountModalRouteKey: jest.fn(),
}));

jest.mock('@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers'),
    consumePreMountReplaceOutcome: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/runAfterClosingScreenUnmount', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/pendingSearchWrite', () => ({
    holdPendingSearchWriteFlush: jest.fn(),
    releasePendingSearchWriteFlush: jest.fn(),
}));

const mockedTakePreMountedFullscreenForReveal = jest.mocked(takePreMountedFullscreenForReveal);
const mockedCancelWideTabPreMount = jest.mocked(cancelWideTabPreMount);
const mockedDiscardWideTabPreMount = jest.mocked(discardWideTabPreMount);
const mockedSetIsRevealingPreMountedFullscreen = jest.mocked(setIsRevealingPreMountedFullscreen);
const mockedReleasePendingSearchWriteFlush = jest.mocked(releasePendingSearchWriteFlush);
const mockedFinishWideTabPreMountReveal = jest.mocked(finishWideTabPreMountReveal);
const mockedSetRevealedWideTabPreMountModalRouteKey = jest.mocked(setRevealedWideTabPreMountModalRouteKey);
const mockedConsumePreMountReplaceOutcome = jest.mocked(consumePreMountReplaceOutcome);
const mockedRunAfterClosingScreenUnmount = jest.mocked(runAfterClosingScreenUnmount);
// eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() does not rely on `this` binding
const mockedGetRootState = jest.mocked(navigationRef.getRootState);
// eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() does not rely on `this` binding
const mockedCurrentDispatch = jest.mocked(navigationRef.current?.dispatch);

const stateWithRHP = createMock<NavigationState>({
    routes: [
        {name: NAVIGATORS.TAB_NAVIGATOR, key: 'tab'},
        {name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, key: 'rhp'},
    ],
    index: 1,
});

describe('revealRouteBeforeDismissingModal with a wide pre-mount', () => {
    let rootState: NavigationState;
    let pendingTransitionCallbacks: Array<() => void | Promise<void>>;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
            callback(0);
            return 0;
        });
        pendingTransitionCallbacks = [];
        jest.spyOn(TransitionTracker, 'runAfterTransitions').mockImplementation(({callback, runImmediately}) => {
            if (runImmediately) {
                callback();
            } else {
                pendingTransitionCallbacks.push(callback);
            }
            return {cancel: () => {}};
        });
        rootState = stateWithRHP;
        mockedGetRootState.mockImplementation(() => rootState);
        mockedTakePreMountedFullscreenForReveal.mockReturnValue(PRE_MOUNTED_ROUTE_KEY);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    function mockReplaceOutcome(outcome: ReturnType<typeof consumePreMountReplaceOutcome>) {
        let pendingOutcome: ReturnType<typeof consumePreMountReplaceOutcome>;
        mockedCurrentDispatch?.mockImplementation((action) => {
            if (!('type' in action) || action.type !== CONST.NAVIGATION.ACTION_TYPE.REPLACE_FULLSCREEN_UNDER_RHP) {
                return;
            }
            pendingOutcome = outcome;
        });
        mockedConsumePreMountReplaceOutcome.mockImplementation(() => {
            const consumed = pendingOutcome;
            pendingOutcome = undefined;
            return consumed;
        });
    }

    it('finishes the pre-mount reveal when the replace shows the pre-mounted screen', () => {
        // Given a replace whose outcome says the pre-mounted screen was shown
        mockReplaceOutcome({routeKey: PRE_MOUNTED_ROUTE_KEY, isRevealed: true});

        // When the reveal runs
        Navigation.revealRouteBeforeDismissingModal(ROUTES.SEARCH_ROOT.getRoute({query: ''}));

        // Then the live pre-mount is ended as revealed
        expect(mockedFinishWideTabPreMountReveal).toHaveBeenCalledWith(PRE_MOUNTED_ROUTE_KEY);
        expect(mockedCancelWideTabPreMount).not.toHaveBeenCalled();
        expect(mockedDiscardWideTabPreMount).not.toHaveBeenCalled();

        // And the RHP it was behind is not recorded yet, since any state that still has this RHP loses the pre-mount
        expect(mockedSetRevealedWideTabPreMountModalRouteKey).not.toHaveBeenCalled();
    });

    it('records the RHP the revealed pre-mount was behind once the dismiss ends', () => {
        // Given a replace whose outcome says the pre-mounted screen was shown
        mockReplaceOutcome({routeKey: PRE_MOUNTED_ROUTE_KEY, isRevealed: true});

        // When the reveal runs and the RHP dismiss transition ends
        Navigation.revealRouteBeforeDismissingModal(ROUTES.SEARCH_ROOT.getRoute({query: ''}));
        for (const callback of pendingTransitionCallbacks) {
            callback();
        }

        // Then the RHP is recorded, so a history entry that still has it is known to be from before the reveal
        expect(mockedSetRevealedWideTabPreMountModalRouteKey).toHaveBeenCalledWith(PRE_MOUNTED_ROUTE_KEY, 'rhp');
    });

    it('discards the pre-mount when the replace runs without it', () => {
        // Given a replace whose outcome says the destination was built without the pre-mounted screen
        mockReplaceOutcome({routeKey: PRE_MOUNTED_ROUTE_KEY, isRevealed: false});

        // When the reveal runs
        Navigation.revealRouteBeforeDismissingModal(ROUTES.SEARCH_ROOT.getRoute({query: ''}));

        // Then the pre-mount is dropped without being marked revealed, and the replaced destination tab is not restored
        expect(mockedDiscardWideTabPreMount).toHaveBeenCalled();
        expect(mockedFinishWideTabPreMountReveal).not.toHaveBeenCalled();
        expect(mockedCancelWideTabPreMount).not.toHaveBeenCalled();

        // And the reveal state is reset right away, so a fresh Search focus before the dismiss ends shows its overlay and flushes
        expect(mockedSetIsRevealingPreMountedFullscreen).toHaveBeenCalledWith(false);
        expect(mockedReleasePendingSearchWriteFlush).toHaveBeenCalled();
    });

    it('cancels the pre-mount when the replace is rejected', () => {
        // Given a replace rejected because the RHP was closed first (e.g. Browser Back), so there is no outcome
        mockReplaceOutcome(undefined);

        // When the reveal runs
        Navigation.revealRouteBeforeDismissingModal(ROUTES.SEARCH_ROOT.getRoute({query: ''}));

        // Then the pre-mount is taken out, so it cannot stay hidden in the stack and show up on a later Back
        expect(mockedCancelWideTabPreMount).toHaveBeenCalled();
        expect(mockedFinishWideTabPreMountReveal).not.toHaveBeenCalled();
        expect(mockedDiscardWideTabPreMount).not.toHaveBeenCalled();

        // And the reveal state is reset right away, so a Search focus before the dismiss ends shows its overlay and flushes
        expect(mockedSetIsRevealingPreMountedFullscreen).toHaveBeenCalledWith(false);
        expect(mockedReleasePendingSearchWriteFlush).toHaveBeenCalled();
    });

    it('defers the caller work and the Search flush past the RHP removal when the pre-mount is revealed', () => {
        // Given a replace whose outcome says the pre-mounted screen was shown, and a caller with work to run after the dismiss
        mockReplaceOutcome({routeKey: PRE_MOUNTED_ROUTE_KEY, isRevealed: true});
        const callerAfterTransition = jest.fn();

        // When the reveal runs and the RHP dismiss transition ends
        Navigation.revealRouteBeforeDismissingModal(ROUTES.SEARCH_ROOT.getRoute({query: ''}), {afterTransition: callerAfterTransition});
        for (const callback of pendingTransitionCallbacks) {
            callback();
        }

        // Then the reveal state is reset, but the caller work and the flush wait for the RHP to unmount, so they do not block it
        expect(mockedSetIsRevealingPreMountedFullscreen).toHaveBeenCalledWith(false);
        expect(callerAfterTransition).not.toHaveBeenCalled();
        expect(mockedReleasePendingSearchWriteFlush).not.toHaveBeenCalled();

        // And both run once the RHP is unmounted
        mockedRunAfterClosingScreenUnmount.mock.calls.at(0)?.[0]();
        expect(mockedReleasePendingSearchWriteFlush).toHaveBeenCalled();
        expect(callerAfterTransition).toHaveBeenCalled();
    });

    it('runs the caller work right when the dismiss ends if the pre-mount is not revealed', () => {
        // Given a replace whose outcome says the destination was built without the pre-mounted screen
        mockReplaceOutcome({routeKey: PRE_MOUNTED_ROUTE_KEY, isRevealed: false});
        const callerAfterTransition = jest.fn();

        // When the reveal runs and the RHP dismiss transition ends
        Navigation.revealRouteBeforeDismissingModal(ROUTES.SEARCH_ROOT.getRoute({query: ''}), {afterTransition: callerAfterTransition});
        for (const callback of pendingTransitionCallbacks) {
            callback();
        }

        // Then the caller work is not delayed, because nothing revealed needs the RHP removal to finish first
        expect(callerAfterTransition).toHaveBeenCalled();
        expect(mockedRunAfterClosingScreenUnmount).not.toHaveBeenCalled();
    });
});
