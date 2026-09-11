import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import getFullScreenUnderRHP from '../utils/getFullScreenUnderRHP';

describe('app download links background on a fresh load', () => {
    it.each([
        ['a report', '/r/123/app-download-links', NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT],
        ['an expense report', '/search/view/123/app-download-links', NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT],
        ['a money request report', '/search/r/123/app-download-links', NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT],
        ['the about page', '/settings/about/app-download-links', NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, SCREENS.SETTINGS.ABOUT],
    ])('keeps the full screen it was opened from: %s', (_label, path, name, central) => {
        expect(getFullScreenUnderRHP(path)).toEqual({name, central});
    });
});
