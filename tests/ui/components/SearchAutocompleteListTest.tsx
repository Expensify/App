import {act, render} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SearchAutocompleteList from '@components/Search/SearchAutocompleteList';

import useFilteredOptions from '@hooks/useFilteredOptions';

import {combineOrderingOfReportsAndPersonalDetails} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import type {OptionData} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../../utils/collections/reportActions';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: jest.fn(),
    useRoute: jest.fn(),
    usePreventRemove: jest.fn(),
    createNavigationContainerRef: jest.fn(() => ({
        getCurrentRoute: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
        removeListener: jest.fn(),
        isReady: jest.fn(() => true),
        getState: jest.fn(),
    })),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        shouldUseNarrowLayout: true,
        isSmallScreenWidth: true,
    })),
}));

jest.mock('@hooks/useFilteredOptions', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        options: {
            reports: [],
            personalDetails: [],
        },
        isLoading: false,
        loadMore: jest.fn(),
        loadAll: jest.fn(),
        hasMore: false,
        isLoadingMore: false,
    })),
}));

jest.mock('@libs/OptionsListUtils', () => ({
    getSearchOptions: jest.fn(() => ({
        options: {
            recentReports: [
                {
                    reportID: '10',
                    keyForList: '10',
                    text: 'Test Report',
                    alternateText: 'alternate text',
                    lastMessageText: 'last message',
                },
            ],
            personalDetails: [],
            currentUserOption: null,
            userToInvite: null,
            categoryOptions: [],
        },
        hasMore: false,
    })),
    combineOrderingOfReportsAndPersonalDetails: jest.fn(() => ({recentReports: [], personalDetails: []})),
    getAlternateText: jest.fn(),
}));

describe('SearchAutocompleteList', () => {
    let mockHtmlToText: jest.SpyInstance;

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        mockHtmlToText = jest.spyOn(Parser, 'htmlToText');
    });

    beforeEach(() => {
        mockHtmlToText.mockClear();
        // Reset to defaults so tests don't leak into each other; the DM test overrides these per phase.
        jest.mocked(useFilteredOptions).mockReturnValue({
            options: {reports: [], personalDetails: []},
            isLoading: false,
            loadMore: jest.fn(),
            loadAll: jest.fn(),
            hasMore: false,
            isLoadingMore: false,
        });
        jest.mocked(combineOrderingOfReportsAndPersonalDetails).mockReturnValue({recentReports: [], personalDetails: []});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('should not call Parser.htmlToText when parentReportAction is ADD_COMMENT', async () => {
        const reportID = '10';
        const parentReportID = '20';
        const parentActionID = '100';

        const parentReportAction = {
            ...createRandomReportAction(Number(parentActionID)),
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        };

        const reportData = {
            reportID,
            parentReportID,
            parentReportActionID: parentActionID,
        };

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, reportData);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
                [parentActionID]: parentReportAction,
            });
        });

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <SearchAutocompleteList
                        autocompleteQueryValue=""
                        handleSearch={jest.fn()}
                        onListItemPress={jest.fn()}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        expect(mockHtmlToText).not.toHaveBeenCalled();
    });

    it('should call Parser.htmlToText when parentReportAction is not ADD_COMMENT', async () => {
        const reportID = '10';
        const parentReportID = '20';
        const parentActionID = '100';
        const parentReportAction = {
            ...createRandomReportAction(Number(parentActionID)),
            actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
        };

        const reportData = {
            reportID,
            parentReportID,
            parentReportActionID: parentActionID,
        };
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, reportData);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
                [parentActionID]: parentReportAction,
            });
        });

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <SearchAutocompleteList
                        autocompleteQueryValue=""
                        handleSearch={jest.fn()}
                        onListItemPress={jest.fn()}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        expect(mockHtmlToText).toHaveBeenCalled();
    });

    it('renders active-search results as a single "Search results" list ordered by the server order', async () => {
        const mockCombineOrdering = jest.mocked(combineOrderingOfReportsAndPersonalDetails);

        const alice: OptionData = {reportID: '456', keyForList: '456', accountID: 123, isDM: true, text: 'Alice', alternateText: '', lastMessageText: ''};
        const bob: OptionData = {reportID: '789', keyForList: '789', accountID: 0, text: 'Bob', alternateText: '', lastMessageText: ''};
        mockCombineOrdering.mockReturnValue({recentReports: [alice, bob], personalDetails: []});

        const {toJSON} = render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <SearchAutocompleteList
                        autocompleteQueryValue="te"
                        handleSearch={jest.fn()}
                        onListItemPress={jest.fn()}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        const tree = JSON.stringify(toJSON());
        // Active search renders one "Search results" section, not a separate "Recent chats" section.
        expect(tree).toContain('Search results');
        expect(tree).not.toContain('Recent chats');
        expect(tree).toContain('Alice');
        expect(tree).toContain('Bob');
        // Rows follow the order recentReportsOptions provides.
        expect(tree.indexOf('Alice')).toBeLessThan(tree.indexOf('Bob'));
    });
});
