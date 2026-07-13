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

    it('keeps a known DM in "Recent chats" after its report loads from search', async () => {
        const mockUseFilteredOptions = jest.mocked(useFilteredOptions);
        const mockCombineOrdering = jest.mocked(combineOrderingOfReportsAndPersonalDetails);

        // Before the report loads, the DM is just a personal detail keyed by accountID.
        const dmAsPersonalDetail: OptionData = {reportID: '', keyForList: '123', accountID: 123, text: 'Alice', alternateText: '', lastMessageText: ''};
        mockCombineOrdering.mockReturnValue({recentReports: [dmAsPersonalDetail], personalDetails: []});

        const {rerender, toJSON} = render(
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

        // The DM shows up under "Recent chats" and its position is now frozen.
        const treeAfterFreeze = JSON.stringify(toJSON());
        expect(treeAfterFreeze).toContain('Recent chats');
        expect(treeAfterFreeze).toContain('Alice');
        expect(treeAfterFreeze.indexOf('Recent chats')).toBeLessThan(treeAfterFreeze.indexOf('Alice'));

        // Now the search results come back. The DM's report loads, so its keyForList flips to the reportID
        // (accountID stays the same). We hand back a new options reference so the list recomputes without
        // touching the query, otherwise the frozen ranks would be rebuilt.
        const dmAsReport: OptionData = {reportID: '456', keyForList: '456', accountID: 123, isDM: true, text: 'Alice', alternateText: '', lastMessageText: ''};
        // Alice also has a task report. It carries her accountID too, but it isn't the DM, so it should end up
        // in the server section rather than pinned under "Recent chats".
        const aliceTaskReport: OptionData = {reportID: '999', keyForList: '999', accountID: 123, isDM: false, isTaskReport: true, text: 'Alice Task', alternateText: '', lastMessageText: ''};
        const brandNewServerReport: OptionData = {reportID: '789', keyForList: '789', accountID: 0, text: 'Bob', alternateText: '', lastMessageText: ''};
        mockUseFilteredOptions.mockReturnValue({
            options: {reports: [], personalDetails: []},
            isLoading: false,
            loadMore: jest.fn(),
            hasMore: false,
            isLoadingMore: false,
        });
        mockCombineOrdering.mockReturnValue({recentReports: [dmAsReport, aliceTaskReport, brandNewServerReport], personalDetails: []});

        rerender(
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

        const treeAfterServer = JSON.stringify(toJSON());
        const recentChatsIndex = treeAfterServer.indexOf('Recent chats');
        // The first "Alice" is the DM row under "Recent chats".
        const aliceDMIndex = treeAfterServer.indexOf('Alice');
        const serverResultsIndex = treeAfterServer.indexOf('Search results');
        const aliceTaskIndex = treeAfterServer.indexOf('Alice Task');
        const bobIndex = treeAfterServer.indexOf('Bob');

        // Both section headers and all three rows rendered.
        expect(recentChatsIndex).toBeGreaterThanOrEqual(0);
        expect(serverResultsIndex).toBeGreaterThan(recentChatsIndex);
        expect(aliceDMIndex).toBeGreaterThanOrEqual(0);
        expect(aliceTaskIndex).toBeGreaterThanOrEqual(0);
        expect(bobIndex).toBeGreaterThanOrEqual(0);

        // The DM stayed under "Recent chats" (before the "Search results" header) despite the keyForList flip.
        expect(aliceDMIndex).toBeGreaterThan(recentChatsIndex);
        expect(aliceDMIndex).toBeLessThan(serverResultsIndex);

        // Alice's task report and Bob's report are in the server section - the task wasn't pinned just
        // because it shares Alice's accountID.
        expect(aliceTaskIndex).toBeGreaterThan(serverResultsIndex);
        expect(bobIndex).toBeGreaterThan(serverResultsIndex);
    });
});
