import type {NavigationState, PartialState} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';

const mockDispatch = jest.fn();
const mockGetRootState = jest.fn();

const ROOT_STATE_KEY = 'root-state-key';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        goBack: jest.fn(),
        dismissModal: jest.fn(),
    },
    navigationRef: {
        getRootState: mockGetRootState,
        current: {dispatch: mockDispatch},
    },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports, rulesdir/no-import-or-require -- require after mock setup to ensure mocks are in place
const goBackFromWorkspaceSettingPages = require('@libs/Navigation/helpers/goBackFromWorkspaceSettingPages').default;
// eslint-disable-next-line @typescript-eslint/no-require-imports, rulesdir/no-import-or-require -- require after mock setup to ensure mocks are in place
const Navigation = require('@libs/Navigation/Navigation').default;

function mockRootState(routes: Array<{name: string; state?: PartialState<NavigationState>}>, index?: number) {
    const state = {
        key: ROOT_STATE_KEY,
        routes,
        index: index ?? routes.length - 1,
    };
    mockGetRootState.mockReturnValue(state);
}

describe('goBackFromWorkspaceSettingPages', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('pops stacked TAB_NAVIGATOR when previous route is Inbox and an underlying TAB_NAVIGATOR exists', () => {
        // Root stack: TAB_NAVIGATOR (idx 0, Inbox inside) → TAB_NAVIGATOR (idx 1, pushed via cross-tab navigation)
        mockRootState([
            {
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    index: 0,
                    routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}],
                } as PartialState<NavigationState>,
            },
            {
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    index: 0,
                    routes: [{name: NAVIGATORS.WORKSPACE_NAVIGATOR}],
                } as PartialState<NavigationState>,
            },
        ]);

        goBackFromWorkspaceSettingPages();

        // Should pop 1 route (from index 1 back to the underlying TAB_NAVIGATOR at index 0)
        expect(mockDispatch).toHaveBeenCalledWith({...StackActions.pop(1), target: ROOT_STATE_KEY});
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('calls dismissModal when previous route is Inbox but no underlying TAB_NAVIGATOR exists', () => {
        // Root stack: REPORTS_SPLIT_NAVIGATOR (not a TAB_NAVIGATOR) → current workspace route
        // secondToLastRoute is REPORTS_SPLIT_NAVIGATOR which getActiveTabName returns directly
        mockRootState([
            {
                name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
            },
            {
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    index: 0,
                    routes: [{name: NAVIGATORS.WORKSPACE_NAVIGATOR}],
                } as PartialState<NavigationState>,
            },
        ]);

        goBackFromWorkspaceSettingPages();

        // No TAB_NAVIGATOR at an index below topRootIndex, so falls through to dismissModal
        expect(Navigation.dismissModal).toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('navigates to WORKSPACES_LIST when previous route is not Inbox', () => {
        // Root stack: TAB_NAVIGATOR with WORKSPACE_NAVIGATOR active → another TAB_NAVIGATOR
        // secondToLastRoute active tab is WORKSPACE_NAVIGATOR, not REPORTS_SPLIT_NAVIGATOR
        mockRootState([
            {
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    index: 0,
                    routes: [{name: NAVIGATORS.WORKSPACE_NAVIGATOR}],
                } as PartialState<NavigationState>,
            },
            {
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    index: 0,
                    routes: [{name: NAVIGATORS.WORKSPACE_NAVIGATOR}],
                } as PartialState<NavigationState>,
            },
        ]);

        goBackFromWorkspaceSettingPages();

        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });
});
