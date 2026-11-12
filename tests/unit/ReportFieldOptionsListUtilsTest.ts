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
            // Given a list opened on "Charlie", with the live selection still matching the value it opened on
            // When the sections are built
            const sections = getReportFieldOptionsSection({
                options: OPTIONS,
                recentlyUsedOptions: [],
                selectedOptions: [{text: 'Charlie'}],
                initiallySelectedValue: 'Charlie',
                searchValue: '',
                translate: translateLocal,
            });

            // Then "Charlie" is pinned to the top in its own checked section, so the user can see what the field
            // currently holds without scrolling a long option list to find it
            const selectedSection = sectionByIndex(sections, 1);
            expect(selectedSection?.data.map((option) => option.keyForList)).toEqual(['Charlie']);
            expect(selectedSection?.data.at(0)?.isSelected).toBe(true);

            // Then it is not repeated in the "All" section, because the same option listed twice reads as two
            // different options the user has to tell apart
            expect(sectionByIndex(sections, 3)?.data.map((option) => option.keyForList)).not.toContain('Charlie');
        });

        it('keeps the frozen value pinned while the live selection drives the checkmark', () => {
            // Given a list that opened on "Charlie" and on which the user has since picked "Delta"
            // When the sections are rebuilt
            const sections = getReportFieldOptionsSection({
                options: OPTIONS,
                recentlyUsedOptions: [],
                selectedOptions: [{text: 'Delta'}],
                initiallySelectedValue: 'Charlie',
                searchValue: '',
                translate: translateLocal,
            });

            // Then "Charlie" stays pinned but loses its checkmark. Pinning on the live selection instead would make
            // the option the user just clicked jump to the top of the list under their cursor
            const selectedSection = sectionByIndex(sections, 1);
            expect(selectedSection?.data.map((option) => option.keyForList)).toEqual(['Charlie']);
            expect(selectedSection?.data.at(0)?.isSelected).toBe(false);

            // Then the checkmark follows the live selection to where "Delta" naturally sits, so the list still shows
            // the user what they picked
            expect(sectionByIndex(sections, 3)?.data.find((option) => option.keyForList === 'Delta')?.isSelected).toBe(true);
        });

        it('keeps the pinned value at the top of the search results when it matches', () => {
            // Given a list pinned to "Rate B" and a search term that every option matches
            // When the sections are built
            const sections = getReportFieldOptionsSection({
                options: ['Rate A', 'Rate B', 'Rate C'],
                recentlyUsedOptions: [],
                selectedOptions: [{text: 'Rate B'}],
                initiallySelectedValue: 'Rate B',
                searchValue: 'Rate',
                translate: translateLocal,
            });

            // Then searching collapses everything into one section but the pinned value still leads it, so the
            // current value does not disappear into the middle of the results the moment the user types
            const searchData = sectionByIndex(sections, 0)?.data.map((option) => option.keyForList) ?? [];
            expect(searchData.at(0)).toBe('Rate B');

            // Then every matching option is still offered exactly once, because pinning reorders the results rather
            // than adding a copy of the current value to them
            expect(searchData).toEqual(expect.arrayContaining(['Rate A', 'Rate B', 'Rate C']));
            expect(searchData).toHaveLength(3);
        });

        it('leaves the selected value in place when pinning is turned off', () => {
            // Given a caller that opts out of pinning, which the inline field does for a short option list
            // When the sections are built
            const sections = getReportFieldOptionsSection({
                options: OPTIONS,
                recentlyUsedOptions: [],
                selectedOptions: [{text: 'Charlie'}],
                initiallySelectedValue: 'Charlie',
                searchValue: '',
                translate: translateLocal,
                shouldPinSelectedOption: false,
            });

            // Then there is no "Selected" section and the options keep their natural order, because a handful of
            // options is easier to scan in a stable order than one that moves the current value to the top
            expect(sectionByIndex(sections, 1)).toBeUndefined();
            expect(sectionByIndex(sections, 3)?.data.map((option) => option.keyForList)).toEqual(OPTIONS);

            // Then the current value is still checked, so turning off pinning changes the ordering only and does not
            // cost the user the ability to see what the field holds
            expect(sectionByIndex(sections, 3)?.data.find((option) => option.keyForList === 'Charlie')?.isSelected).toBe(true);
        });

        it('drops the section titles when they are turned off', () => {
            // Given a caller that opts out of section titles and data that would otherwise produce two titled
            // sections, "Recent" and "All"
            // When the sections are built
            const sections = getReportFieldOptionsSection({
                options: OPTIONS,
                recentlyUsedOptions: ['Delta'],
                selectedOptions: [],
                initiallySelectedValue: '',
                searchValue: '',
                translate: translateLocal,
                shouldShowSectionTitles: false,
            });

            // Then both sections are still built but neither carries a title, so a small popover is not made to spend
            // its limited height on headers while the options themselves stay grouped
            expect(sections.map((section) => section.title)).toEqual(['', '']);
        });

        it('does not force-show the pinned value when it does not match the search', () => {
            // Given a list pinned to "Rate B" and a search term that only "Zulu" matches
            // When the sections are built
            const sections = getReportFieldOptionsSection({
                options: ['Rate A', 'Rate B', 'Zulu'],
                recentlyUsedOptions: [],
                selectedOptions: [{text: 'Rate B'}],
                initiallySelectedValue: 'Rate B',
                searchValue: 'Zulu',
                translate: translateLocal,
            });

            // Then only "Zulu" is offered. Pinning decides where a matching value sits, so it must not smuggle a
            // non-matching option into results the user has explicitly filtered down
            expect(sectionByIndex(sections, 0)?.data.map((option) => option.keyForList)).toEqual(['Zulu']);
        });
    });
});
