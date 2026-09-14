import {getReportFieldOptionsSection} from '@libs/ReportFieldOptionsListUtils';

import IntlStore from '@src/languages/IntlStore';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const OPTIONS = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'];

/** Returns the section whose sectionIndex matches (Selected=1, Recent=2, All=3, Search=0). */
function sectionByIndex(sections: ReturnType<typeof getReportFieldOptionsSection>, sectionIndex: number) {
    return sections.find((section) => section.sectionIndex === sectionIndex);
}

describe('ReportFieldOptionsListUtils', () => {
    beforeAll(() => {
        IntlStore.load('en');
        return waitForBatchedUpdates();
    });

    describe('getReportFieldOptionsSection', () => {
        it('pins the frozen initial value to its own "Selected" section on top and excludes it from the "All" section', () => {
            const sections = getReportFieldOptionsSection({
                options: OPTIONS,
                recentlyUsedOptions: [],
                // Live selection matches the frozen one on open.
                selectedOptions: [{text: 'Charlie'}],
                initiallySelectedValue: 'Charlie',
                searchValue: '',
                translate: translateLocal,
            });

            const selectedSection = sectionByIndex(sections, 1);
            expect(selectedSection?.data.map((option) => option.keyForList)).toEqual(['Charlie']);
            expect(selectedSection?.data.at(0)?.isSelected).toBe(true);
            // The pinned value must not be duplicated in the "All" section.
            expect(sectionByIndex(sections, 3)?.data.map((option) => option.keyForList)).not.toContain('Charlie');
        });

        it('keeps the frozen value pinned while the live selection drives the checkmark', () => {
            const sections = getReportFieldOptionsSection({
                options: OPTIONS,
                recentlyUsedOptions: [],
                // The user picked "Delta" (live), but the list opened on "Charlie" (frozen).
                selectedOptions: [{text: 'Delta'}],
                initiallySelectedValue: 'Charlie',
                searchValue: '',
                translate: translateLocal,
            });

            const selectedSection = sectionByIndex(sections, 1);
            // "Charlie" stays pinned (frozen) but is no longer checked...
            expect(selectedSection?.data.map((option) => option.keyForList)).toEqual(['Charlie']);
            expect(selectedSection?.data.at(0)?.isSelected).toBe(false);
            // ...and the live selection "Delta" is checked where it sits in the "All" section.
            expect(sectionByIndex(sections, 3)?.data.find((option) => option.keyForList === 'Delta')?.isSelected).toBe(true);
        });

        it('keeps the pinned value at the top of the search results when it matches', () => {
            const sections = getReportFieldOptionsSection({
                options: ['Rate A', 'Rate B', 'Rate C'],
                recentlyUsedOptions: [],
                selectedOptions: [{text: 'Rate B'}],
                initiallySelectedValue: 'Rate B',
                searchValue: 'Rate',
                translate: translateLocal,
            });

            // Search collapses to a single section; the pinned value leads regardless of its natural position.
            const searchData = sectionByIndex(sections, 0)?.data.map((option) => option.keyForList) ?? [];
            expect(searchData.at(0)).toBe('Rate B');
            expect(searchData).toEqual(expect.arrayContaining(['Rate A', 'Rate B', 'Rate C']));
            expect(searchData).toHaveLength(3);
        });

        it('does not force-show the pinned value when it does not match the search', () => {
            const sections = getReportFieldOptionsSection({
                options: ['Rate A', 'Rate B', 'Zulu'],
                recentlyUsedOptions: [],
                selectedOptions: [{text: 'Rate B'}],
                initiallySelectedValue: 'Rate B',
                searchValue: 'Zulu',
                translate: translateLocal,
            });

            expect(sectionByIndex(sections, 0)?.data.map((option) => option.keyForList)).toEqual(['Zulu']);
        });
    });
});
