import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';

import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const SEARCH_PATH = '/search?q=type:expense';
const SERVER_PATH_WITH_ORIGIN = `/${ROUTES.TEST_TOOLS_SERVER.getRoute(SEARCH_PATH)}`;
const MONEY_REQUEST_ADD_CATEGORY_PATH = [
    '/create/create/start/1/2447837621260601/manual/category/add-category',
    '?action=create&iouType=create&transactionID=1&reportID=2447837621260601',
].join('');
const TEST_TOOLS_PATH_WITH_MONEY_REQUEST_ORIGIN = `/${ROUTES.TEST_TOOLS_MODAL.getRoute(MONEY_REQUEST_ADD_CATEGORY_PATH)}`;

function getState(path: string) {
    const state = getAdaptedStateFromPath(path, undefined);
    const modalRoute = state?.routes.find((route) => route.name === NAVIGATORS.TEST_TOOLS_MODAL_NAVIGATOR);
    const tabRoute = state?.routes.find((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);

    return {
        serverParams: modalRoute?.state?.routes?.find((route) => route.name === SCREENS.TEST_TOOLS_MODAL.SERVER)?.params,
        screensInModal: modalRoute?.state?.routes?.map((route) => route.name),
        screensUnderneath: tabRoute?.state?.routes?.map((route) => route.name),
    };
}

describe('reloading the test tools server page', () => {
    it('keeps the page the modal was opened from in the URL', () => {
        expect(SERVER_PATH_WITH_ORIGIN).toBe(`/test-tools/server?backTo=${encodeURIComponent(SEARCH_PATH)}`);
    });

    it('hands that page to the selector, so closing the modal can return there', () => {
        expect(getState(SERVER_PATH_WITH_ORIGIN).serverParams).toEqual({backTo: SEARCH_PATH});
    });

    it('rebuilds the test tools menu underneath, so going back stays in the modal', () => {
        expect(getState(SERVER_PATH_WITH_ORIGIN).screensInModal).toEqual([SCREENS.TEST_TOOLS_MODAL.ROOT, SCREENS.TEST_TOOLS_MODAL.SERVER]);
    });

    it('rebuilds that page underneath the modal rather than defaulting to Home', () => {
        expect(getState(SERVER_PATH_WITH_ORIGIN).screensUnderneath).toContain(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    });

    it('keeps a money request flow under the modal so its discard guard remains mounted', () => {
        const state = getAdaptedStateFromPath(TEST_TOOLS_PATH_WITH_MONEY_REQUEST_ORIGIN, undefined);

        expect(state.routes.map((route) => route.name)).toEqual([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR, NAVIGATORS.TEST_TOOLS_MODAL_NAVIGATOR]);
    });

    it('round trips back to the same URL', () => {
        expect(getPathFromState(getAdaptedStateFromPath(SERVER_PATH_WITH_ORIGIN, undefined))).toBe(SERVER_PATH_WITH_ORIGIN);
    });

    it('opens over Home when the URL carries no origin', () => {
        expect(getState(`/${ROUTES.TEST_TOOLS_SERVER.getRoute()}`).serverParams).toBeUndefined();
        expect(getState(`/${ROUTES.TEST_TOOLS_SERVER.getRoute()}`).screensUnderneath).toContain(SCREENS.HOME);
    });
});
