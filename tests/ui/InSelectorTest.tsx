import {render} from '@testing-library/react-native';

import InSelector from '@components/Search/FilterComponents/InSelector';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';

import CONST from '@src/CONST';

import React from 'react';

// The list of reports returned by the (mocked) options pipeline. Tests mutate this to switch between a
// long list (pinning enabled) and a short list (pinning disabled).
let mockRecentReports: Array<{reportID: string; keyForList: string; text: string}> = [];

jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/InviteMemberListItem', () => jest.fn(() => null));
jest.mock('@components/Search/FilterComponents/ListFilterViewWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));

jest.mock('@components/OnyxListItemProvider', () => ({usePersonalDetails: jest.fn(() => ({}))}));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));
jest.mock('@hooks/useDebouncedState', () => jest.fn(() => ['', '', jest.fn()]));
jest.mock('@hooks/useFilteredOptions', () => jest.fn(() => ({options: {recentReports: [], personalDetails: []}, isLoading: false})));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({email: 'me@expensify.com', accountID: 999})));
jest.mock('@hooks/useSortedActions', () => jest.fn(() => ({})));
jest.mock('@hooks/useReportAttributes', () => jest.fn(() => ({})));
jest.mock('@hooks/usePrivateIsArchivedMap', () => jest.fn(() => ({})));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@libs/actions/Report', () => ({searchInServer: jest.fn()}));
jest.mock('@libs/DeviceCapabilities', () => ({canUseTouchScreen: () => false}));
jest.mock('@libs/OptionsListUtils', () => ({
    // Build a minimal option object from the report id the component passes in.
    createOptionFromReport: (report: {reportID: string}) => ({reportID: report.reportID, keyForList: report.reportID, text: `Report ${report.reportID}`}),
    getSearchOptions: () => ({options: {recentReports: [], personalDetails: []}}),
    filterAndOrderOptions: () => ({recentReports: mockRecentReports, personalDetails: []}),
    // Mirror the real helper for an empty search term: the passed-in selectedOptions become the top section verbatim.
    formatSectionsFromSearchTerm: (searchTerm: string, selectedOptions: unknown[]) => ({section: {sectionIndex: 0, data: selectedOptions}}),
    getAlternateText: () => '',
}));

type SectionData = {reportID?: string; keyForList: string; isSelected?: boolean};

describe('InSelector', () => {
    const mockedSelectionList = jest.mocked(SelectionListWithSections);

    const buildRecentReports = (count: number) =>
        Array.from({length: count}, (_, index) => ({
            reportID: `r${index}`,
            keyForList: `r${index}`,
            text: `Report ${index}`,
        }));

    const getSections = () => mockedSelectionList.mock.lastCall?.[0].sections as Array<{data: SectionData[]}>;

    beforeEach(() => {
        mockedSelectionList.mockClear();
        // A long list so the "move selected to top" behavior is enabled.
        mockRecentReports = buildRecentReports(CONST.STANDARD_LIST_ITEM_LIMIT + 2);
    });

    it('floats the initially-selected report to the top of a long list', () => {
        render(
            <InSelector
                value={['r10']}
                onChange={jest.fn()}
            />,
        );

        const sections = getSections();
        // Top section holds only the pre-selected report.
        expect(sections.at(0)?.data.map((item) => item.keyForList)).toEqual(['r10']);
        // Main section keeps every other report in its natural order, with the pinned one removed.
        expect(sections.at(1)?.data.map((item) => item.keyForList)).not.toContain('r10');
        expect(sections.at(1)?.data).toHaveLength(CONST.STANDARD_LIST_ITEM_LIMIT + 1);
    });

    it('keeps a report in place when it is toggled after first render (does not jump to the top)', () => {
        const {rerender} = render(
            <InSelector
                value={['r10']}
                onChange={jest.fn()}
            />,
        );

        // Simulate the user toggling another report on: the parent re-renders the filter with the updated value.
        rerender(
            <InSelector
                value={['r10', 'r3']}
                onChange={jest.fn()}
            />,
        );

        const sections = getSections();
        // Only the originally pre-selected report stays pinned at the top.
        expect(sections.at(0)?.data.map((item) => item.keyForList)).toEqual(['r10']);

        // The newly toggled report is marked selected but stays in its natural position (index 3) instead of jumping up.
        const mainSection = sections.at(1)?.data ?? [];
        expect(mainSection.findIndex((item) => item.keyForList === 'r3')).toBe(3);
        expect(mainSection.find((item) => item.keyForList === 'r3')?.isSelected).toBe(true);
    });

    it('does not pin selected reports to the top of a short list', () => {
        mockRecentReports = buildRecentReports(5);

        render(
            <InSelector
                value={['r2']}
                onChange={jest.fn()}
            />,
        );

        const sections = getSections();
        // No pinned section for a short list.
        expect(sections.at(0)?.data).toHaveLength(0);
        // Every report stays in place; the selected one is simply marked in position.
        const mainSection = sections.at(1)?.data ?? [];
        expect(mainSection.map((item) => item.keyForList)).toEqual(['r0', 'r1', 'r2', 'r3', 'r4']);
        expect(mainSection.find((item) => item.keyForList === 'r2')?.isSelected).toBe(true);
    });
});
