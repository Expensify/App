import NAVIGATORS from '@src/NAVIGATORS';

import getFullScreenUnderRHP from '../utils/getFullScreenUnderRHP';

describe('contact methods background on a fresh load', () => {
    describe('resolves the base path when the contact methods screens are opened from a report', () => {
        it.each([
            ['the list', '/r/123/contact-methods'],
            ['the contact method details', '/r/123/contact-methods/a%40b.com/details'],
            ['the new contact method form', '/r/123/contact-methods/new-contact-method'],
            ['the new contact method magic code', '/r/123/contact-methods/new/confirm-validate-code'],
        ])('%s', (_label, path) => {
            expect(getFullScreenUnderRHP(path).name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        });
    });

    describe('resolves the base path when the base is itself a right hand panel route', () => {
        it.each([
            ['the expense report list', '/search/view/123/contact-methods'],
            ['the expense report details', '/search/view/123/contact-methods/a%40b.com/details'],
            ['the money request report details', '/search/r/123/contact-methods/a%40b.com/details'],
            ['the new contact method magic code', '/search/view/123/contact-methods/new/confirm-validate-code'],
        ])('%s', (_label, path) => {
            expect(getFullScreenUnderRHP(path).name).toBe(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
        });
    });

    describe('keeps the settings split under the settings deep links', () => {
        it.each([
            ['the list', '/settings/profile/contact-methods'],
            ['the contact method details', '/settings/profile/contact-methods/a%40b.com/details'],
            ['the new contact method form', '/settings/profile/contact-methods/new-contact-method'],
        ])('%s', (_label, path) => {
            expect(getFullScreenUnderRHP(path).name).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
        });
    });
});
