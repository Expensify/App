import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';

import NAVIGATORS from '@src/NAVIGATORS';

/**
 * The contact methods screens are dynamic routes appended to whatever screen opened them, so the
 * full screen under the overlay has to come from the base path. In-app navigation never exercises
 * that, because linkTo skips full screen matching while an RHP is already on top, so only a fresh
 * load of the URL can catch a screen that is still pinned to a central pane in the relations.
 */
function getBackgroundFullScreenName(path: string): string | undefined {
    const state = getAdaptedStateFromPath(path, undefined);
    const tabRoute = state?.routes?.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    const tabState = tabRoute?.state;
    return tabState?.routes?.at(tabState.index ?? (tabState.routes?.length ?? 1) - 1)?.name;
}

describe('contact methods background on a fresh load', () => {
    describe('resolves the base path when the contact methods screens are opened from a report', () => {
        it.each([
            ['the list', '/r/123/contact-methods'],
            ['the contact method details', '/r/123/contact-methods/a%40b.com/details'],
            ['the new contact method form', '/r/123/contact-methods/new-contact-method'],
            ['the new contact method magic code', '/r/123/contact-methods/new/confirm-validate-code'],
        ])('%s', (_label, path) => {
            expect(getBackgroundFullScreenName(path)).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        });
    });

    describe('resolves the base path when the base is itself a right hand panel route', () => {
        it.each([
            ['the expense report list', '/search/view/123/contact-methods'],
            ['the expense report details', '/search/view/123/contact-methods/a%40b.com/details'],
            ['the money request report details', '/search/r/123/contact-methods/a%40b.com/details'],
            ['the new contact method magic code', '/search/view/123/contact-methods/new/confirm-validate-code'],
        ])('%s', (_label, path) => {
            expect(getBackgroundFullScreenName(path)).toBe(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
        });
    });

    describe('keeps the settings split under the settings deep links', () => {
        it.each([
            ['the list', '/settings/profile/contact-methods'],
            ['the contact method details', '/settings/profile/contact-methods/a%40b.com/details'],
            ['the new contact method form', '/settings/profile/contact-methods/new-contact-method'],
        ])('%s', (_label, path) => {
            expect(getBackgroundFullScreenName(path)).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
        });
    });
});
