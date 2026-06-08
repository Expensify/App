import getTopmostFullScreenRoute from '@libs/Navigation/helpers/getTopmostFullScreenRoute';
import NAVIGATORS from '@src/NAVIGATORS';

const mockGetRootState = jest.fn();

jest.mock('@libs/Navigation/Navigation', () => ({
    navigationRef: {
        getRootState: () => mockGetRootState() as unknown,
    },
}));

describe('getTopmostFullScreenRoute', () => {
    beforeEach(() => {
        mockGetRootState.mockReset();
    });

    it('returns undefined when there is no root state', () => {
        mockGetRootState.mockReturnValue(undefined);
        expect(getTopmostFullScreenRoute()).toBeUndefined();
    });

    it('returns undefined when there is no TAB_NAVIGATOR route in the root state', () => {
        mockGetRootState.mockReturnValue({
            routes: [{name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}, {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}],
        });
        expect(getTopmostFullScreenRoute()).toBeUndefined();
    });

    it('returns undefined when the TAB_NAVIGATOR has no nested state yet', () => {
        mockGetRootState.mockReturnValue({
            routes: [{name: NAVIGATORS.TAB_NAVIGATOR}],
        });
        expect(getTopmostFullScreenRoute()).toBeUndefined();
    });

    it('returns the focused tab route based on state.index', () => {
        const reportsRoute = {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR};
        const searchRoute = {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR};
        mockGetRootState.mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 1,
                        routes: [reportsRoute, searchRoute],
                    },
                },
            ],
        });
        expect(getTopmostFullScreenRoute()).toBe(searchRoute);
    });

    it('falls back to the first child route when state.index is missing', () => {
        const reportsRoute = {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR};
        const searchRoute = {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR};
        mockGetRootState.mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        routes: [reportsRoute, searchRoute],
                    },
                },
            ],
        });
        expect(getTopmostFullScreenRoute()).toBe(reportsRoute);
    });

    it('returns the focused tab of the topmost TAB_NAVIGATOR when multiple exist', () => {
        const oldFocused = {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR};
        const newFocused = {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR};
        mockGetRootState.mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 0,
                        routes: [oldFocused],
                    },
                },
                {name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR},
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 0,
                        routes: [newFocused],
                    },
                },
            ],
        });
        expect(getTopmostFullScreenRoute()).toBe(newFocused);
    });
});
