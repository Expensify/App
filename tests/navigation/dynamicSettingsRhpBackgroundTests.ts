import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import getFullScreenUnderRHP from '../utils/getFullScreenUnderRHP';

describe('dynamic settings RHP screens on a fresh load', () => {
    it.each([
        ['a report', '/r/123/app-download-links', NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT],
        ['an expense report', '/search/view/123/app-download-links', NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT],
        ['a money request report', '/search/r/123/app-download-links', NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, SCREENS.SEARCH.ROOT],
        ['the about page', '/settings/about/app-download-links', NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, SCREENS.SETTINGS.ABOUT],
        ['a report, add payment card', '/r/123/add-payment-card', NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT],
        ['the subscription page', '/settings/subscription/add-payment-card', NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, SCREENS.SETTINGS.SUBSCRIPTION.ROOT],
    ])('keeps the full screen it was opened from: %s', (_label, path, name, central) => {
        expect(getFullScreenUnderRHP(path)).toEqual({name, central});
    });
});
