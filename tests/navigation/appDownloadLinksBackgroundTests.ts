import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';

import NAVIGATORS from '@src/NAVIGATORS';

function getBackgroundFullScreenName(path: string): string | undefined {
    const state = getAdaptedStateFromPath(path, undefined);
    const tabRoute = state?.routes?.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    const tabState = tabRoute?.state;
    return tabState?.routes?.at(tabState.index ?? (tabState.routes?.length ?? 1) - 1)?.name;
}

describe('app download links background on a fresh load', () => {
    it.each([
        ['a report', '/r/123/app-download-links', NAVIGATORS.REPORTS_SPLIT_NAVIGATOR],
        ['an expense report', '/search/view/123/app-download-links', NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR],
        ['a money request report', '/search/r/123/app-download-links', NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR],
        ['the about page', '/settings/about/app-download-links', NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR],
    ])('keeps the full screen it was opened from: %s', (_label, path, expected) => {
        expect(getBackgroundFullScreenName(path)).toBe(expected);
    });
});
