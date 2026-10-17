import {takePreMountedFullscreenForReveal} from '@libs/Navigation/helpers/preMountBuffer';
import {cancelWideTabPreMount, finishWideTabPreMountReveal} from '@libs/Navigation/helpers/wideTabPreMount';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

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
    finishWideTabPreMountReveal: jest.fn(),
}));

jest.mock('@libs/pendingSearchWrite', () => ({
    holdPendingSearchWriteFlush: jest.fn(),
    releasePendingSearchWriteFlush: jest.fn(),
}));

const mockedTakePreMountedFullscreenForReveal = jest.mocked(takePreMountedFullscreenForReveal);
const mockedCancelWideTabPreMount = jest.mocked(cancelWideTabPreMount);
const mockedFinishWideTabPreMountReveal = jest.mocked(finishWideTabPreMountReveal);
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

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
            callback(0);
            return 0;
        });
        rootState = stateWithRHP;
        mockedGetRootState.mockImplementation(() => rootState);
        mockedTakePreMountedFullscreenForReveal.mockReturnValue(PRE_MOUNTED_ROUTE_KEY);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('finishes the pre-mount reveal when the replace is applied', () => {
        // Given a replace that installs the destination under the RHP
        mockedCurrentDispatch?.mockImplementation((action) => {
            if (!('type' in action) || action.type !== CONST.NAVIGATION.ACTION_TYPE.REPLACE_FULLSCREEN_UNDER_RHP) {
                return;
            }
            rootState = createMock<NavigationState>({...stateWithRHP, routes: [...stateWithRHP.routes]});
        });

        // When the reveal runs
        Navigation.revealRouteBeforeDismissingModal(ROUTES.SEARCH_ROOT.getRoute({query: ''}));

        // Then the pre-mount is handed over to the reveal instead of being taken out
        expect(mockedFinishWideTabPreMountReveal).toHaveBeenCalledWith(PRE_MOUNTED_ROUTE_KEY);
        expect(mockedCancelWideTabPreMount).not.toHaveBeenCalled();
    });

    it('cancels the pre-mount when the replace is rejected', () => {
        // Given a replace rejected because the RHP was closed first (e.g. Browser Back), so the root state stays the same
        mockedCurrentDispatch?.mockImplementation(() => {});

        // When the reveal runs
        Navigation.revealRouteBeforeDismissingModal(ROUTES.SEARCH_ROOT.getRoute({query: ''}));

        // Then the pre-mount is taken out, so it cannot stay hidden in the stack and show up on a later Back
        expect(mockedCancelWideTabPreMount).toHaveBeenCalled();
        expect(mockedFinishWideTabPreMountReveal).not.toHaveBeenCalled();
    });
});
